import type {
  AdequacyCheck,
  CalculationResult,
  EquipmentActuals,
  EquipmentDefaults,
  EquipmentEvaluation,
  EquipmentPlan,
  SystemOptionId,
} from "../types/project";

const ceilTo = (value: number, step: number): number => Math.ceil(value / Math.max(1, step)) * Math.max(1, step);
const safePositive = (value: number, fallback: number): number => (Number.isFinite(value) && value > 0 ? value : fallback);

export function generateEquipmentPlan(result: CalculationResult, defaults: EquipmentDefaults): EquipmentPlan {
  const panelWatts = safePositive(defaults.panelWatts, 450);
  const batteryVoltage = safePositive(defaults.batteryVoltage, 24);
  const batteryAh = safePositive(defaults.batteryAh, 100);
  const batteryWh = batteryVoltage * batteryAh;
  const mpptAmpStep = safePositive(defaults.mpptAmpStep, 10);
  const inverterWattStep = safePositive(defaults.inverterWattStep, 500);
  const sharedSolarRequirement = Math.max(result.dc.recommendedSolarArrayW, result.hybrid.recommendedSolarArrayW);
  const sharedBatteryRequirement = Math.max(result.dc.requiredBatteryWh, result.hybrid.requiredBatteryWh);

  return {
    shared: {
      panelCount: Math.max(1, Math.ceil(sharedSolarRequirement / panelWatts)),
      panelWatts,
      batteryCount: Math.max(1, Math.ceil(sharedBatteryRequirement / batteryWh)),
      batteryVoltage,
      batteryAh,
    },
    dc: {
      controllerCount: 1,
      mpptAmps: ceilTo(result.dc.recommendedMpptCurrentA, mpptAmpStep),
    },
    hybrid: {
      controllerCount: 1,
      mpptAmps: ceilTo(result.hybrid.recommendedMpptCurrentA, mpptAmpStep),
      inverterCount: result.hybrid.recommendedInverterW > 0 ? Math.ceil(result.hybrid.recommendedInverterW / inverterWattStep) : 0,
      inverterWatts: inverterWattStep,
    },
    balance: {
      dcDistributionCount: 1,
      acDistributionCount: 1,
      cablingCount: 1,
      earthingCount: 1,
      monitoringCount: 1,
    },
  };
}

export function getEquipmentActuals(plan: EquipmentPlan): EquipmentActuals {
  return {
    solarArrayW: plan.shared.panelCount * plan.shared.panelWatts,
    batteryWh: plan.shared.batteryCount * plan.shared.batteryVoltage * plan.shared.batteryAh,
    dcMpptA: plan.dc.controllerCount * plan.dc.mpptAmps,
    hybridMpptA: plan.hybrid.controllerCount * plan.hybrid.mpptAmps,
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

export function evaluateEquipmentPlan(result: CalculationResult, plan: EquipmentPlan, systemId: SystemOptionId): EquipmentEvaluation {
  const actuals = getEquipmentActuals(plan);
  const sizing = systemId === "dc" ? result.dc : result.hybrid;
  const checks = [
    check("Solar array", actuals.solarArrayW, sizing.recommendedSolarArrayW, "W"),
    check("Battery storage", actuals.batteryWh, sizing.requiredBatteryWh, "Wh"),
    check("MPPT/controller", systemId === "dc" ? actuals.dcMpptA : actuals.hybridMpptA, sizing.recommendedMpptCurrentA, "A"),
  ];

  if (systemId === "hybrid") {
    checks.push(check("Inverter capacity", actuals.hybridInverterW, sizing.recommendedInverterW, "W"));
  }

  const warnings = checks.flatMap((item) => (item.warning ? [item.warning] : []));

  return {
    systemId,
    status: warnings.length === 0 ? "Preliminary checks met" : "Needs attention",
    checks,
    warnings,
  };
}
