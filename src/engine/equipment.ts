import type {
  AdequacyCheck,
  CalculationResult,
  EquipmentActuals,
  EquipmentDefaults,
  EquipmentEvaluation,
  EquipmentPlan,
  PricingSettings,
  ProductCatalog,
  ProductItem,
  SystemOptionId,
  Project,
  Assumptions,
} from "../types/project";
import sampleData from "../data/sample-project.json";
import productsData from "../data/default-products.json";

const ceilTo = (value: number, step: number): number => Math.ceil(value / Math.max(1, step)) * Math.max(1, step);
const safePositive = (value: number, fallback: number): number => (Number.isFinite(value) && value > 0 ? value : fallback);
const defaultCatalog = productsData as ProductCatalog;

interface ProductChoice {
  item: ProductItem;
  count: number;
  total: number;
}

// Prefer materially cheaper systems, then reduce component count when the cost is within 30%.
function practicalChoice(choices: ProductChoice[]): ProductChoice | undefined {
  if (choices.length === 0) return undefined;
  const cheapest = Math.min(...choices.map((choice) => choice.total));
  return choices
    .filter((choice) => choice.total <= cheapest * 1.3)
    .sort((a, b) => a.count - b.count || a.total - b.total)[0];
}

function selectPanel(requirement: number, maximumWatts: number, catalog: ProductCatalog): ProductChoice | undefined {
  return practicalChoice(catalog.solarPanels
    .filter((item) => item.watts && item.watts <= maximumWatts)
    .map((item) => {
      const count = Math.ceil(requirement / item.watts!);
      return { item, count, total: count * item.unitCost };
    }));
}

function selectBattery(requirement: number, maximumWh: number, project: Project, catalog: ProductCatalog, dischargeW: number): ProductChoice | undefined {
  const choices = catalog.batteries.flatMap((item) => {
    if (!item.voltage || !item.ampHours || !item.wattHours) return [];
    const series = batterySeriesCount(project.systemVoltage, item.voltage);
    if (!series || series > (item.maxSeries ?? 1)) return [];
    const powerStrings = item.continuousDischargeA ? Math.ceil(dischargeW / (project.systemVoltage * item.continuousDischargeA)) : 0;
    const count = Math.max(Math.ceil(requirement / (item.wattHours * series)), powerStrings) * series;
    if (count / series > (item.maxParallel ?? 1)) return [];
    return [{ item, count, total: count * item.unitCost, parallelStrings: count / series }];
  });
  const preferred = choices.filter((choice) => choice.item.wattHours! <= maximumWh);
  const pool = preferred.length ? preferred : choices;
  const manageable = pool.filter((choice) => choice.parallelStrings <= 4);
  return practicalChoice(manageable.length > 0 ? manageable : pool);
}

function selectController(requirement: number, maximumAmps: number, voltage: number, arrayWatts: number, catalog: ProductCatalog): ProductChoice | undefined {
  const compatible = catalog.chargeControllers.filter((item) => item.amps && item.supportedVoltages?.includes(voltage));
  const preferred = compatible.filter((item) => item.amps! <= maximumAmps);
  return practicalChoice((preferred.length ? preferred : compatible)
    .map((item) => {
      const pvLimit = item.pvWattsByVoltage?.[String(voltage)];
      const count = Math.max(Math.ceil(requirement / item.amps!), pvLimit ? Math.ceil(arrayWatts / pvLimit) : 0);
      return { item, count, total: count * item.unitCost };
    }));
}

export function matchedInverter(plan: EquipmentPlan, catalog: ProductCatalog = defaultCatalog): ProductItem | undefined {
  return catalog.hybridInverters.find((item) => item.id === plan.hybrid.inverterProductId && item.watts === plan.hybrid.inverterWatts);
}

export function includedMpptAmps(plan: EquipmentPlan, catalog: ProductCatalog = defaultCatalog): number {
  // Parallel inverter operation is not modeled; never multiply an integrated MPPT by an edited quantity.
  return plan.hybrid.inverterCount === 1 ? matchedInverter(plan, catalog)?.integratedMpptA ?? 0 : 0;
}

export function supplementaryControllers(inverter: ProductItem, controller: ProductItem | undefined, voltage: number, arrayWatts: number, requiredAmps: number): number | undefined {
  const residualA = Math.max(0, requiredAmps - (inverter.integratedMpptA ?? 0));
  const residualW = Math.max(0, arrayWatts - (inverter.maxPvWatts ?? 0));
  if (!residualA && !residualW) return 0;
  const pvLimit = controller?.pvWattsByVoltage?.[String(voltage)];
  if (!controller?.amps || !controller.supportedVoltages?.includes(voltage) || !pvLimit) return undefined;
  return Math.max(Math.ceil(residualA / controller.amps), Math.ceil(residualW / pvLimit));
}

export function inverterDescription(plan: EquipmentPlan): string {
  if (plan.hybrid.inverterCount === 0) return "No inverter installed";
  const item = matchedInverter(plan);
  return item ? `${item.name}; ${item.systemVoltage} V input; ${item.inverterType === "integrated" ? `${includedMpptAmps(plan)} A MPPT included` : "separate MPPT"}` : "Inverter specification unverified; matching quote required";
}

function accessoryPrice(items: ProductItem[], arrayWatts: number, fallback: number): number {
  const sorted = [...items].sort((a, b) => (a.maxArrayWatts ?? Number.POSITIVE_INFINITY) - (b.maxArrayWatts ?? Number.POSITIVE_INFINITY));
  return (sorted.find((item) => (item.maxArrayWatts ?? Number.POSITIVE_INFINITY) >= arrayWatts) ?? sorted[sorted.length - 1])?.unitCost ?? fallback;
}

export function isStarterPricing(pricing: PricingSettings): boolean {
  return (Object.keys(sampleData.pricing) as Array<keyof typeof sampleData.pricing>).every((key) => pricing[key] === sampleData.pricing[key])
    && (pricing.hybridControllerUnitUsd === undefined || pricing.hybridControllerUnitUsd === sampleData.pricing.controllerUnitUsd);
}

export function pricingForGeneratedPlan(plan: EquipmentPlan, fallback: PricingSettings, catalog: ProductCatalog = defaultCatalog): PricingSettings {
  const panel = catalog.solarPanels.find((item) => item.id === plan.shared.panelProductId);
  const battery = catalog.batteries.find((item) => item.id === plan.shared.batteryProductId);
  const controllerAmps = plan.dc.mpptAmps || plan.hybrid.mpptAmps;
  const controller = catalog.chargeControllers.find((item) => item.id === plan.dc.controllerProductId && item.amps === controllerAmps);
  const hybridController = catalog.chargeControllers.find((item) => item.id === plan.hybrid.controllerProductId && item.amps === plan.hybrid.mpptAmps);
  const inverter = matchedInverter(plan, catalog);
  const arrayWatts = plan.shared.panelCount * plan.shared.panelWatts;
  return {
    panelUnitUsd: panel?.unitCost ?? fallback.panelUnitUsd,
    batteryUnitUsd: battery?.unitCost ?? fallback.batteryUnitUsd,
    controllerUnitUsd: controller?.unitCost ?? fallback.controllerUnitUsd,
    hybridControllerUnitUsd: hybridController?.unitCost ?? fallback.hybridControllerUnitUsd ?? fallback.controllerUnitUsd,
    inverterUnitUsd: inverter?.unitCost ?? fallback.inverterUnitUsd,
    dcDistributionUnitUsd: accessoryPrice(catalog.dcDistribution, arrayWatts, fallback.dcDistributionUnitUsd),
    acDistributionUnitUsd: accessoryPrice(catalog.acDistribution, arrayWatts, fallback.acDistributionUnitUsd),
    cablingUnitUsd: accessoryPrice(catalog.cabling, arrayWatts, fallback.cablingUnitUsd),
    earthingUnitUsd: accessoryPrice(catalog.earthing, arrayWatts, fallback.earthingUnitUsd),
    monitoringUnitUsd: fallback.monitoringUnitUsd,
  };
}

// Treat LiFePO4 nameplate voltages as their corresponding nominal system class.
export function batterySeriesCount(systemVoltage: number, batteryVoltage: number): number | undefined {
  const nominal = (voltage: number) => ({ 12.8: 12, 25.6: 24, 51.2: 48 }[voltage] ?? voltage);
  const ratio = nominal(systemVoltage) / nominal(batteryVoltage);
  return Number.isInteger(ratio) && ratio >= 1 ? ratio : undefined;
}

export function requiredControllerAmps(arrayWatts: number, project: Project, assumptions: Assumptions): number {
  return ceilTo(arrayWatts / project.systemVoltage * assumptions.mpptSafetyFactor, 5);
}

export function generateEquipmentPlan(result: CalculationResult, defaults: EquipmentDefaults, project: Project, assumptions: Assumptions, catalog: ProductCatalog = defaultCatalog): EquipmentPlan {
  const maximumPanelWatts = safePositive(defaults.panelWatts, 450);
  const maximumBatteryWh = safePositive(defaults.batteryVoltage, 25.6) * safePositive(defaults.batteryAh, 100);
  const maximumControllerAmps = safePositive(defaults.mpptAmpStep, 60);
  const sharedSolarRequirement = Math.max(result.dc.recommendedSolarArrayW, result.hybrid.recommendedSolarArrayW);
  const sharedBatteryRequirement = Math.max(result.dc.requiredBatteryWh, result.hybrid.requiredBatteryWh);
  const panelChoice = selectPanel(sharedSolarRequirement, maximumPanelWatts, catalog);
  const panelWatts = panelChoice?.item.watts ?? maximumPanelWatts;
  const panelCount = panelChoice?.count ?? Math.ceil(sharedSolarRequirement / panelWatts);
  const dischargeW = Math.max(result.peakLoadW / assumptions.dcDistributionEfficiency,
    (result.peakLoadW - result.acPeakLoadW) / assumptions.hybridDcEfficiency + result.acPeakLoadW / assumptions.inverterEfficiency);
  const batteryChoice = selectBattery(sharedBatteryRequirement, maximumBatteryWh, project, catalog, dischargeW);
  const batteryVoltage = batteryChoice?.item.voltage ?? ({ 12: 12.8, 24: 25.6, 48: 51.2 }[project.systemVoltage] ?? project.systemVoltage);
  const batteryAh = batteryChoice?.item.ampHours ?? 0;
  const controllerRequirement = requiredControllerAmps(panelCount * panelWatts, project, assumptions);
  const arrayWatts = panelCount * panelWatts;
  const controllerChoice = selectController(controllerRequirement, maximumControllerAmps, project.systemVoltage, arrayWatts, catalog);
  const mpptAmpStep = controllerChoice?.item.amps ?? 0;
  const controllerCount = controllerChoice?.count ?? 0;
  const combinations = result.hybrid.recommendedInverterW > 0 ? catalog.hybridInverters
    .filter((item) => item.systemVoltage === project.systemVoltage && item.watts! >= result.hybrid.recommendedInverterW)
    .map((item) => {
      const count = supplementaryControllers(item, controllerChoice?.item, project.systemVoltage, arrayWatts, controllerRequirement);
      return { item, externalCount: count ?? 0, resolved: count !== undefined, total: item.unitCost + (count ?? 0) * (controllerChoice?.item.unitCost ?? 0) };
    }).filter((choice) => choice.resolved).sort((a, b) => a.total - b.total || a.item.watts! - b.item.watts!) : [];
  const inverterChoice = combinations[0];
  const inverterWatts = inverterChoice?.item.watts ?? 0;
  const hasDemand = sharedSolarRequirement > 0;

  return {
    shared: {
      panelProductId: panelChoice?.item.id,
      batteryProductId: batteryChoice?.item.id,
      panelCount,
      panelWatts,
      batteryCount: batteryChoice?.count ?? 0,
      batteryVoltage,
      batteryAh,
    },
    dc: {
      controllerProductId: controllerChoice?.item.id,
      controllerCount,
      mpptAmps: mpptAmpStep,
    },
    hybrid: {
      controllerProductId: controllerChoice?.item.id,
      inverterProductId: inverterChoice?.item.id,
      controllerCount: inverterChoice?.externalCount ?? controllerCount,
      mpptAmps: mpptAmpStep,
      inverterCount: inverterChoice ? 1 : 0,
      inverterWatts,
    },
    balance: {
      dcDistributionCount: hasDemand ? 1 : 0,
      acDistributionCount: result.hybrid.recommendedInverterW > 0 ? 1 : 0,
      cablingCount: hasDemand ? 1 : 0,
      earthingCount: hasDemand ? 1 : 0,
      monitoringCount: hasDemand && (sharedSolarRequirement > 300 || result.loadRows.filter((row) => row.runningWatts > 0).length > 1) ? 1 : 0,
    },
  };
}

export function getEquipmentActuals(plan: EquipmentPlan): EquipmentActuals {
  return {
    solarArrayW: plan.shared.panelCount * plan.shared.panelWatts,
    batteryWh: plan.shared.batteryCount * plan.shared.batteryVoltage * plan.shared.batteryAh,
    dcMpptA: plan.dc.controllerCount * plan.dc.mpptAmps,
    hybridMpptA: plan.hybrid.controllerCount * plan.hybrid.mpptAmps + includedMpptAmps(plan),
    hybridInverterW: plan.hybrid.inverterCount * plan.hybrid.inverterWatts,
  };
}

const fmt = (value: number, unit: string): string => {
  if (unit === "Wh" && value >= 1000) return `${(value / 1000).toFixed(2)} kWh`;
  return `${Math.round(value).toLocaleString()} ${unit}`;
};

function check(label: string, actual: number, required: number, unit: string): AdequacyCheck {
  const passed = actual >= required;
  return {
    label,
    actual,
    required,
    unit,
    passed,
    warning: passed ? undefined : `${label} is ${fmt(actual, unit)}; recommendation is ${fmt(required, unit)}.`,
  };
}

export function evaluateEquipmentPlan(result: CalculationResult, plan: EquipmentPlan, systemId: SystemOptionId, project: Project, assumptions: Assumptions): EquipmentEvaluation {
  const actuals = getEquipmentActuals(plan);
  const sizing = systemId === "dc" ? result.dc : result.hybrid;
  const checks = [
    check("Solar array", actuals.solarArrayW, sizing.recommendedSolarArrayW, "W"),
    check("Battery storage", actuals.batteryWh, sizing.requiredBatteryWh, "Wh"),
    check("MPPT/controller", systemId === "dc" ? actuals.dcMpptA : actuals.hybridMpptA, Math.max(sizing.recommendedMpptCurrentA, requiredControllerAmps(actuals.solarArrayW, project, assumptions)), "A"),
  ];

  if (systemId === "hybrid") {
    checks.push(check("Inverter capacity", actuals.hybridInverterW, sizing.recommendedInverterW, "W"));
  }

  const warnings = checks.flatMap((item) => (item.warning ? [item.warning] : []));
  const notes: string[] = [];
  const activeLoads = result.loadRows.filter((row) => row.runningWatts > 0);
  const seriesCount = batterySeriesCount(project.systemVoltage, plan.shared.batteryVoltage);
  if (![12, 24, 48].includes(project.systemVoltage)) warnings.push("This system voltage has no supported catalogue configuration. Choose 12, 24 or 48 V, or obtain a reviewed custom design.");
  const battery = defaultCatalog.batteries.find((item) => item.id === plan.shared.batteryProductId && item.voltage === plan.shared.batteryVoltage && item.ampHours === plan.shared.batteryAh);
  if (activeLoads.length && !battery) warnings.push("Battery specification is unverified or no compatible battery was found. Regenerate equipment or obtain a matching battery quote; this estimate may be incomplete.");
  if (battery && seriesCount && plan.shared.batteryCount > 0) {
    if (seriesCount > (battery.maxSeries ?? 1)) warnings.push("Battery series connection is not approved in the reference specification. Use a native-voltage battery or a manufacturer-approved string.");
    if (plan.shared.batteryCount / seriesCount > (battery.maxParallel ?? 1)) warnings.push("Battery parallel quantity exceeds the documented limit or parallel approval is unknown.");
    const dischargeW = systemId === "dc" ? result.peakLoadW / assumptions.dcDistributionEfficiency : (result.peakLoadW - result.acPeakLoadW) / assumptions.hybridDcEfficiency + result.acPeakLoadW / assumptions.inverterEfficiency;
    if (!battery.continuousDischargeA) warnings.push("Battery continuous discharge limit is unknown. Confirm the BMS rating against running and starting loads.");
    else if (dischargeW / project.systemVoltage > battery.continuousDischargeA * plan.shared.batteryCount / seriesCount) warnings.push("Battery BMS continuous discharge current is below the running-load requirement.");
    notes.push(`Battery reference: ${battery.name}. Series limit: ${battery.maxSeries ?? "unknown"}; parallel limit: ${battery.maxParallel ?? "unknown"}. Starting-current duration and charge limits require review.`);
  }
  const selectedController = systemId === "dc" ? plan.dc : plan.hybrid;
  const controllerProduct = defaultCatalog.chargeControllers.find((item) => item.id === selectedController.controllerProductId && item.amps === selectedController.mpptAmps);
  if (selectedController.controllerCount > 0 && !controllerProduct?.supportedVoltages?.includes(project.systemVoltage)) warnings.push("Separate MPPT/controller voltage or rating is unverified or incompatible with the system voltage.");
  const inverterProduct = matchedInverter(plan);
  if (systemId === "hybrid" && sizing.recommendedInverterW > 0 && (!inverterProduct || inverterProduct.systemVoltage !== project.systemVoltage || plan.hybrid.inverterCount !== 1)) warnings.push("A compatible single inverter has not been verified for this voltage and demand. Obtain a matching quote; the estimate may be incomplete.");
  const integratedPvW = systemId === "hybrid" && plan.hybrid.inverterCount === 1 ? inverterProduct?.maxPvWatts ?? 0 : 0;
  const externalPvW = (controllerProduct?.pvWattsByVoltage?.[String(project.systemVoltage)] ?? 0) * selectedController.controllerCount;
  if (activeLoads.length && actuals.solarArrayW > integratedPvW + externalPvW) warnings.push("Installed PV exceeds documented controller input power, or the PV input limit is unknown. Review array allocation and obtain a matching controller.");
  if (activeLoads.length === 0) warnings.push("No active loads. Enter quantity, watts and hours per day above zero to size a system.");
  if (plan.shared.batteryCount > 0 && (!seriesCount || plan.shared.batteryCount % seriesCount !== 0)) {
    warnings.push(`The ${plan.shared.batteryCount} batteries at ${plan.shared.batteryVoltage} V do not form complete strings for a ${project.systemVoltage} V system. Check battery voltage and quantity.`);
  } else if (seriesCount && seriesCount > 1 && plan.shared.batteryCount > 0) {
    notes.push(`Battery count assumes ${seriesCount} identical batteries per series string. Confirm the manufacturer permits series connection and the BMS supports it.`);
  }
  if (seriesCount && plan.shared.batteryCount / seriesCount > 4) {
    warnings.push(`The battery bank requires ${plan.shared.batteryCount / seriesCount} parallel strings. Consider a larger compatible battery class and have the busbars, protection, cabling and BMS coordination reviewed.`);
  }
  if (systemId === "dc" && activeLoads.some((row) => row.load.currentType === "AC")) {
    warnings.push("AC loads are listed. Fully DC sizing assumes DC replacements at the listed wattages; confirm replacements and update their wattages, or choose Hybrid DC + AC.");
  }
  if (activeLoads.some((row) => row.load.currentType === "DC" && row.load.voltage !== project.systemVoltage)) {
    notes.push("Some DC loads use a different voltage from the battery bus. Include suitable regulated DC-DC, USB or PoE supplies; do not connect them directly to the battery.");
  }
  if (systemId === "hybrid" && plan.hybrid.inverterCount > 1) {
    warnings.push("Inverter watts are an aggregate only. Multiple inverters cannot be assumed to share a load; confirm approved parallel operation or separately sized circuits.");
  }
  if (systemId === "hybrid" && plan.hybrid.inverterCount > 0) {
    notes.push("Check continuous watts, VA, starting surge duration and temperature ratings. Inverter idle consumption is not included: add it as a DC load for the hours the inverter remains on.");
    notes.push(inverterDescription(plan));
    if (includedMpptAmps(plan) > 0) notes.push("Integrated MPPT capacity is included once in the inverter price. Any separately listed controller covers the remaining array; verify PV string allocation and input voltage windows.");
  }
  if (actuals.solarArrayW > 0) notes.push("MPPT checks use the larger of demand and installed array power. PV string voltage, short-circuit current and battery/BMS charge limits still need component checks.");
  if ((systemId === "dc" ? plan.dc.controllerCount : plan.hybrid.controllerCount) > 1) notes.push("Controller amps are combined. Allocate a separate compatible PV array to each controller and verify the combined battery charge current.");
  if (project.equipmentPlanMode === "custom" && systemId === "hybrid" && plan.hybrid.inverterCount > 0 && plan.hybrid.inverterWatts !== sampleData.equipmentDefaults.inverterWattStep && project.pricing.inverterUnitUsd === sampleData.pricing.inverterUnitUsd) {
    warnings.push(`Inverter price is still the USD ${sampleData.pricing.inverterUnitUsd} starter allowance for 1000 W; the plan uses ${plan.hybrid.inverterWatts} W per inverter. Update the unit price from a matching quote.`);
  }
  if (project.equipmentPlanMode === "custom" && plan.shared.panelCount > 0 && plan.shared.panelWatts !== sampleData.equipmentDefaults.panelWatts && project.pricing.panelUnitUsd === sampleData.pricing.panelUnitUsd) warnings.push(`Panel price is still the starter allowance for 450 W, but the plan uses ${plan.shared.panelWatts} W per panel. Review the unit price.`);
  if (project.equipmentPlanMode === "custom" && plan.shared.batteryCount > 0 && (plan.shared.batteryVoltage !== sampleData.equipmentDefaults.batteryVoltage || plan.shared.batteryAh !== sampleData.equipmentDefaults.batteryAh) && project.pricing.batteryUnitUsd === sampleData.pricing.batteryUnitUsd) notes.push("Battery price is the starter allowance for 25.6 V / 100 Ah. Confirm a quote for the edited battery specification.");
  const controller = systemId === "dc" ? plan.dc : plan.hybrid;
  const controllerPrice = systemId === "dc" ? project.pricing.controllerUnitUsd : project.pricing.hybridControllerUnitUsd ?? project.pricing.controllerUnitUsd;
  if (project.equipmentPlanMode === "custom" && controller.controllerCount > 0 && controller.mpptAmps !== sampleData.equipmentDefaults.mpptAmpStep && controllerPrice === sampleData.pricing.controllerUnitUsd) warnings.push(`Controller price is still the USD ${sampleData.pricing.controllerUnitUsd} starter allowance for 60 A; the plan uses ${controller.mpptAmps} A per controller. Review the unit price.`);
  if (activeLoads.length > 0) {
    notes.push("Peak assumes all active loads run together. Surge assumes one device group starts while others run; simultaneous restarts can require more power. Zero quantity or hours excludes a row.");
    notes.push("Battery Wh is nominal storage before depth-of-discharge limits. Autonomy covers all loads, including non-critical loads; the critical flag only identifies priority energy. Check battery/BMS discharge current as well as energy capacity.");
    notes.push("Solar covers typical daily use plus the reserve allowance. Use low-season peak sun hours; a larger battery alone does not guarantee recovery after several cloudy days.");
    notes.push("Prices are editable allowances. Recheck unit prices when ratings change; taxes, delivery, mounting and site-specific work may need additional allowance.");
  }

  return {
    systemId,
    status: warnings.length === 0 ? "Preliminary checks met" : "Needs attention",
    checks,
    warnings,
    notes,
  };
}
