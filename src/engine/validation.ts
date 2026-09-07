import type { Assumptions, EquipmentPlan, LoadItem, Project } from "../types/project";

export interface ValidationIssue {
  path: string;
  message: string;
}

const finite = (value: number): boolean => Number.isFinite(value);

function range(path: string, label: string, value: number, minimum: number, maximum: number): ValidationIssue[] {
  if (!finite(value) || value < minimum || value > maximum) {
    return [{ path, message: `${label} must be between ${minimum} and ${maximum}.` }];
  }
  return [];
}

function nonNegative(path: string, label: string, value: number, integer = false): ValidationIssue[] {
  if (!finite(value) || value < 0 || value > 1_000_000 || (integer && !Number.isInteger(value))) {
    return [{ path, message: `${label} must be a ${integer ? "whole " : ""}number between 0 and 1000000.` }];
  }
  return [];
}

export function validateLoads(loads: LoadItem[]): ValidationIssue[] {
  return loads.flatMap((load, index) => {
    const label = load.name.trim() || `Load ${index + 1}`;
    return [
      ...(load.name.trim() ? [] : [{ path: `loads.${index}.name`, message: `Load ${index + 1} needs a name.` }]),
      ...nonNegative(`loads.${index}.quantity`, `${label} quantity`, load.quantity, true),
      ...nonNegative(`loads.${index}.watts`, `${label} watts`, load.watts),
      ...range(`loads.${index}.hoursPerDay`, `${label} hours per day`, load.hoursPerDay, 0, 24),
      ...range(`loads.${index}.voltage`, `${label} voltage`, load.voltage, 1, 1000),
      ...range(`loads.${index}.surgeMultiplier`, `${label} surge multiplier`, load.surgeMultiplier, 1, 20),
    ];
  });
}

export function validateProject(project: Project): ValidationIssue[] {
  return [
    ...(project.name.trim() ? [] : [{ path: "name", message: "Project name is required." }]),
    ...(project.country.trim() ? [] : [{ path: "country", message: "Country is required." }]),
    ...range("systemVoltage", "System voltage", project.systemVoltage, 12, 100),
    ...range("sunHours", "Sun hours", project.sunHours, 0.5, 24),
    ...range("autonomyDays", "Autonomy days", project.autonomyDays, 0.5, 30),
    ...range("usdExchangeRate", "USD exchange rate", project.usdExchangeRate, 0.000001, 1_000_000),
    ...validateLoads(project.loads),
  ];
}

export function validateAssumptions(assumptions: Assumptions): ValidationIssue[] {
  return [
    ...range("dcDistributionEfficiency", "DC efficiency", assumptions.dcDistributionEfficiency, 0.01, 1),
    ...range("hybridDcEfficiency", "Hybrid DC efficiency", assumptions.hybridDcEfficiency, 0.01, 1),
    ...range("inverterEfficiency", "Inverter efficiency", assumptions.inverterEfficiency, 0.01, 1),
    ...range("batteryDepthOfDischarge", "Battery depth of discharge", assumptions.batteryDepthOfDischarge, 0.01, 1),
    ...range("arrayDerateFactor", "PV derate", assumptions.arrayDerateFactor, 0.01, 1),
    ...range("batteryReserveFactor", "Battery reserve", assumptions.batteryReserveFactor, 1, 3),
    ...range("mpptSafetyFactor", "MPPT safety factor", assumptions.mpptSafetyFactor, 1, 3),
    ...range("inverterHeadroomFactor", "Inverter headroom", assumptions.inverterHeadroomFactor, 1, 3),
    ...range("installationRate", "Installation rate", assumptions.installationRate, 0, 1),
    ...range("contingencyRate", "Contingency rate", assumptions.contingencyRate, 0, 1),
  ];
}

export function validateEquipmentPlan(plan: EquipmentPlan): ValidationIssue[] {
  const values: Array<[string, string, number, boolean]> = [
    ["shared.panelCount", "Panel quantity", plan.shared.panelCount, true],
    ["shared.panelWatts", "Panel wattage", plan.shared.panelWatts, false],
    ["shared.batteryCount", "Battery quantity", plan.shared.batteryCount, true],
    ["shared.batteryVoltage", "Battery voltage", plan.shared.batteryVoltage, false],
    ["shared.batteryAh", "Battery capacity", plan.shared.batteryAh, false],
    ["dc.controllerCount", "DC controller quantity", plan.dc.controllerCount, true],
    ["dc.mpptAmps", "DC controller current", plan.dc.mpptAmps, false],
    ["hybrid.controllerCount", "Hybrid controller quantity", plan.hybrid.controllerCount, true],
    ["hybrid.mpptAmps", "Hybrid controller current", plan.hybrid.mpptAmps, false],
    ["hybrid.inverterCount", "Inverter quantity", plan.hybrid.inverterCount, true],
    ["hybrid.inverterWatts", "Inverter wattage", plan.hybrid.inverterWatts, false],
    ["balance.dcDistributionCount", "DC distribution quantity", plan.balance.dcDistributionCount, true],
    ["balance.acDistributionCount", "AC distribution quantity", plan.balance.acDistributionCount, true],
    ["balance.cablingCount", "Cabling quantity", plan.balance.cablingCount, true],
    ["balance.earthingCount", "Earthing quantity", plan.balance.earthingCount, true],
    ["balance.monitoringCount", "Monitoring quantity", plan.balance.monitoringCount, true],
  ];
  return values.flatMap(([path, label, value, integer]) => nonNegative(path, label, value, integer));
}
