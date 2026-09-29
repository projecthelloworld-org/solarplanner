import { balancedFit } from "./balanced-fit";
import { priceDetails, priceIdentity } from "./pricing";
import { calculateProject } from "./calculations";
import { estimateCosts } from "./costing";
import { evaluateEquipmentPlan, generateEquipmentPlan, generateEquipmentCandidates, equipmentFit, includedMpptAmps, getEquipmentActuals, isStarterPricing, matchedInverter, pricingForGeneratedPlan } from "./equipment";
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
    return generateEquipmentCandidates(result, site.equipmentDefaults, site, assumptions, choices).map(plan => {
      const pricing = { ...pricingForGeneratedPlan(plan, site.pricing, catalog), ...saved.pricingOverrides };
      const cost = estimateCosts(site, plan, pricing, assumptions, system);
      return { result, plan, pricing, cost, equipmentCost: cost.subtotalUsd, ...equipmentFit(plan, result, site, assumptions, catalog) };
    });
  };
  const candidates = system === "hybrid" && initial.acPeakLoadW > 0
    ? catalog.hybridInverters.filter(p => !inverterChecks(initial, p, site).some(c => c.status === "failed")).flatMap(assemble).filter(c => c.plan.hybrid.inverterCount === 1)
    : assemble();
  const selected = balancedFit(candidates);
  const fallbackResult = calculated(site, assumptions);
  const generated = selected ?? {
    result: fallbackResult,
    plan: generateEquipmentPlan(fallbackResult, site.equipmentDefaults, site, assumptions, { ...catalog, hybridInverters: [] }),
  };
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
    priceDetails: priceDetails(plan, pricing, saved, system, catalog),
    cost: estimateCosts(site, plan, pricing, assumptions, system),
    selectionExplanation: saved.mode === "custom"
      ? "Manually edited equipment; compare installed capacities with the requirements below."
      : selected ? "Balanced fit: closest combined capacity fit within 10% of the lowest eligible equipment cost. Existing reserves are included; missing specifications still require review."
      : "No complete compatible catalogue combination was found. Unresolved equipment requires a reviewed quotation; the estimate is incomplete.",
    capacityComparison: [
      { label: "Solar array", required: result[system].recommendedSolarArrayW, installed: actuals.solarArrayW, unit: "W" },
      { label: "Battery nominal energy", required: result[system].requiredBatteryWh, installed: actuals.batteryWh, unit: "Wh" },
      { label: "Controller output (installed array)", required: evaluation.checks.find(c => c.label === "MPPT/controller")!.required, installed: plan[system].controllerCount * plan[system].mpptAmps + (system === "hybrid" ? includedMpptAmps(plan, catalog) : 0), unit: "A" },
    ].map(c => ({ ...c, excessPercent: c.required > 0 ? (c.installed / c.required - 1) * 100 : undefined })),
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

/** Regenerate both options, preserving quotes and only ratings for unchanged equipment. */
export function regenerateEquipment(project: Project, assumptions: Assumptions, previous = getProjectBundle(project, assumptions)): Project {
  const next = structuredClone(project);
  next.optionPlans = { ...next.optionPlans };
  for (const system of ["dc", "hybrid"] as const) {
    const saved = structuredClone(optionState(next, system));
    next.optionPlans[system] = { ...saved, mode: "generated", equipment: undefined };
  }
  const groups = ["panel", "battery", "controller", "inverter"] as const;
  for (let pass = 0; pass < 5; pass++) {
    const bundle = getProjectBundle(next, assumptions);
    let cleared = false;
    for (const system of ["dc", "hybrid"] as const) {
      const saved = next.optionPlans[system]!;
      for (const group of groups) {
        const field = group === "panel" ? "panelUnitUsd" : group === "battery" ? "batteryUnitUsd" : group === "inverter" ? "inverterUnitUsd" : system === "dc" ? "controllerUnitUsd" : "hybridControllerUnitUsd";
        if (saved.engineering?.[group] && priceIdentity(previous.options[system].plan, field) !== priceIdentity(bundle.options[system].plan, field)) {
          delete saved.engineering[group]; cleared = true;
        }
      }
    }
    if (!cleared) break;
  }
  next.equipmentPlanMode = "generated";
  next.equipmentPlan = undefined;
  return next;
}
