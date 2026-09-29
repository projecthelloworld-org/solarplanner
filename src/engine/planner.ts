import { calculateProject } from "./calculations";
import { estimateCosts } from "./costing";
import { evaluateEquipmentPlan, generateEquipmentPlan, getEquipmentActuals, isStarterPricing, matchedInverter, pricingForGeneratedPlan } from "./equipment";
import { buildRecommendations } from "./recommendations";
import { engineeringCheck, engineeringFor, inverterChecks, inverterRequirement, withRatings } from "./engineering";
import sample from "../data/sample-project.json";
import products from "../data/default-products.json";
import type { Assumptions, EquipmentPlan, OptionPlanState, ProductCatalog, ProductItem, Project, SystemOptionId } from "../types/project";
import { selectedSystemFor, systemOptionName } from "../utils/format";

export function optionState(project: Project, system: SystemOptionId): OptionPlanState {
  return project.optionPlans?.[system] ?? { mode: project.equipmentPlanMode, equipment: project.equipmentPlan, pricingOverrides: isStarterPricing(project.pricing) ? {} : project.pricing };
}

export function currentPlan(project: Project, generatedPlan: EquipmentPlan): EquipmentPlan {
  const state = optionState(project, selectedSystemFor(project));
  return state.mode === "custom" && state.equipment ? state.equipment : generatedPlan;
}

function resolvedCatalog(project: Project, system: SystemOptionId, base: ProductCatalog): ProductCatalog {
  const settings = engineeringFor(project, system);
  return {
    ...base,
    batteries: base.batteries.map((p) => withRatings(p, settings.battery)),
    solarPanels: base.solarPanels.map((p) => withRatings(p, settings.panel)),
    chargeControllers: base.chargeControllers.map((p) => withRatings(p, settings.controller)),
    hybridInverters: base.hybridInverters.map((p) => withRatings(p, settings.inverter)),
  };
}

function calculated(project: Project, assumptions: Assumptions, inverter?: ProductItem, count = 0) {
  const overrides = engineeringFor(project, "hybrid").inverter;
  const efficiency = overrides?.efficiency ?? inverter?.efficiency;
  return calculateProject(project, assumptions, {
    efficiency,
    source: efficiency === undefined ? "fallback" : overrides?.efficiency !== undefined ? "manual" : "manufacturer",
    productId: inverter?.id,
    noLoadWatts: (overrides?.noLoadWatts ?? inverter?.noLoadWatts) === undefined ? undefined : (overrides?.noLoadWatts ?? inverter!.noLoadWatts!) * count,
    inverterPresent: count > 0,
  });
}

function optionBundle(project: Project, assumptions: Assumptions, system: SystemOptionId, base: ProductCatalog) {
  const saved = optionState(project, system);
  const site = { ...project, pricing: { ...sample.pricing }, selectedSystem: system, equipmentPlanMode: saved.mode, equipmentPlan: saved.equipment };
  const catalog = resolvedCatalog(site, system, base);
  const initial = calculated(site, assumptions);
  const assemble = (inverter?: ProductItem) => {
    const result = system === "hybrid" ? calculated(site, assumptions, inverter, inverter ? 1 : 0) : initial;
    const choices = { ...catalog, hybridInverters: inverter ? [inverter] : [] };
    const plan = generateEquipmentPlan(result, site.equipmentDefaults, site, assumptions, choices);
    const pricing = { ...pricingForGeneratedPlan(plan, site.pricing, catalog), ...saved.pricingOverrides };
    const cost = estimateCosts(site, plan, pricing, assumptions, system);
    return { result, plan, pricing, cost };
  };
  const candidates = system === "hybrid" && initial.acPeakLoadW > 0
    ? catalog.hybridInverters.filter((p) => !inverterChecks(initial, p, site).some((c) => c.status === "failed")).map(assemble)
      .filter((c) => c.plan.hybrid.inverterCount === 1)
      .sort((a, b) => a.cost.totalUsd - b.cost.totalUsd || a.plan.hybrid.inverterWatts - b.plan.hybrid.inverterWatts)
    : [];
  const generated = candidates[0] ?? assemble();
  const plan = saved.mode === "custom" && saved.equipment ? saved.equipment : generated.plan;
  const inverter = system === "hybrid" && plan.hybrid.inverterCount > 0 ? matchedInverter(plan, catalog) : undefined;
  const result = system === "hybrid" ? calculated(site, assumptions, inverter, plan.hybrid.inverterCount) : generated.result;
  const pricing = { ...pricingForGeneratedPlan(plan, site.pricing, catalog), ...saved.pricingOverrides };
  const evaluation = evaluateEquipmentPlan(result, plan, system, { ...site, pricing }, assumptions, catalog);
  if (system === "hybrid" && result.acPeakLoadW > 0 && !inverter) {
    const relevant = catalog.hybridInverters.filter((p) => p.systemVoltage === site.systemVoltage);
    if (relevant.length && relevant.every((p) => inverterChecks(result, p, site).some((c) => c.status === "failed" && /AC voltage|AC frequency/.test(c.label)))) {
      const detail = "No catalogue inverter matches the entered AC supply voltage/frequency. Appliance values are retained; select compatible equipment or review the entered supply.";
      evaluation.checks.push(engineeringCheck("AC supply compatibility", "failed", detail));
      evaluation.warnings.push(detail);
      evaluation.status = "Needs attention";
    }
  }
  const actuals = getEquipmentActuals(plan);
  const usableBatteryWh = actuals.batteryWh * assumptions.batteryDepthOfDischarge;
  return {
    result, plan, generatedPlan: generated.plan, pricing, evaluation, actuals,
    cost: estimateCosts(site, plan, pricing, assumptions, system),
    effectiveInverterRequirementW: inverterRequirement(result, inverter),
    usableBatteryWh,
    modeledAutonomyDays: result[system].adjustedDailyWh > 0 ? usableBatteryWh / result[system].adjustedDailyWh : undefined,
    designAutonomyDays: result[system].adjustedDailyWh > 0 ? usableBatteryWh / (result[system].adjustedDailyWh * assumptions.batteryReserveFactor) : undefined,
    products: { panel: catalog.solarPanels.find((p) => p.id === plan.shared.panelProductId && p.watts === plan.shared.panelWatts), battery: catalog.batteries.find((p) => p.id === plan.shared.batteryProductId && p.voltage === plan.shared.batteryVoltage && p.ampHours === plan.shared.batteryAh), controller: catalog.chargeControllers.find((p) => p.id === plan[system].controllerProductId && p.amps === plan[system].mpptAmps), inverter },
  };
}

export function getProjectBundle(project: Project, assumptions: Assumptions, catalog: ProductCatalog = products as ProductCatalog) {
  const options = { dc: optionBundle(project, assumptions, "dc", catalog), hybrid: optionBundle(project, assumptions, "hybrid", catalog) };
  const selected = options[selectedSystemFor(project)];
  const result = { ...options.hybrid.result, dc: options.dc.result.dc };
  const evaluations = { dc: options.dc.evaluation, hybrid: options.hybrid.evaluation };
  return { ...selected, options, result, evaluations, costs: [options.dc.cost, options.hybrid.cost], recommendations: buildRecommendations(project, result, evaluations.dc) };
}

export function getSelectedReportBundle(project: Project, assumptions: Assumptions) {
  const bundle = getProjectBundle(project, assumptions);
  const selectedSystem = selectedSystemFor(project);
  return {
    ...bundle, selectedSystem, selectedSystemName: systemOptionName(selectedSystem),
    selectedSizing: bundle.result[selectedSystem], selectedEvaluation: bundle.evaluation,
    selectedMpptRequirement: bundle.evaluation.checks.find((c) => c.label === "MPPT/controller")!.required,
    selectedCost: bundle.cost, selectedRecommendation: bundle.recommendations.find((r) => r.id === selectedSystem)!,
  };
}
