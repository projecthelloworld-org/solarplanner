import type { CalculationResult, Project, SystemRecommendation, EquipmentEvaluation } from "../types/project";

const formatKwh = (wh: number): string => `${(wh / 1000).toFixed(1)} kWh`;

export function buildRecommendations(project: Project, result: CalculationResult, dcEvaluation: EquipmentEvaluation): SystemRecommendation[] {
  const acLoadCount = project.loads.filter((load) => load.currentType === "AC").length;
  const dcSummary =
    acLoadCount > 0
      ? "Assumes AC devices are replaced with compatible DC equipment. Review replacement wattages before choosing this option."
      : "A simple direct-current architecture that avoids inverter losses and keeps the installation compact.";

  return [
    {
      id: "dc",
      name: "Fully DC System",
      summary: dcSummary,
      lines: [
        {
          category: "Energy target",
          recommendation: `${formatKwh(result.dc.adjustedDailyWh)} adjusted daily demand`,
          rationale: "Uses DC distribution efficiency to account for wiring, conversion, and operating margin.",
        },
        {
          category: "Battery",
          recommendation: `${formatKwh(result.dc.requiredBatteryWh)} LiFePO4 nominal storage`,
          rationale: `Sized for ${project.autonomyDays} autonomy day(s) at the configured depth of discharge.`,
        },
        {
          category: "Solar array",
          recommendation: `${result.dc.recommendedSolarArrayW.toLocaleString()} W PV array`,
          rationale: `Based on ${project.sunHours} peak sun hour(s) with derating. Use a low-sun-season estimate; extra autonomy does not automatically size rapid recovery after cloudy days.`,
        },
        {
          category: "Charge control",
          recommendation: `${dcEvaluation.checks.find((check) => check.label === "MPPT/controller")!.required} A MPPT at ${project.systemVoltage} V`,
          rationale: "Controller current covers demand or the installed array, whichever is larger, with the configured headroom.",
        },
      ],
    },
    {
      id: "hybrid",
      name: "Hybrid DC + AC System",
      summary: "Keeps efficient DC supply for network loads while adding AC capacity for devices that cannot move to DC.",
      lines: [
        {
          category: "Energy target",
          recommendation: `${formatKwh(result.hybrid.adjustedDailyWh)} adjusted daily demand`,
          rationale: "Applies inverter efficiency only to AC loads while preserving a DC path for DC equipment.",
        },
        {
          category: "Battery",
          recommendation: `${formatKwh(result.hybrid.requiredBatteryWh)} LiFePO4 nominal storage`,
          rationale: `Sized for ${project.autonomyDays} autonomy day(s), including reserve and depth-of-discharge limits.`,
        },
        {
          category: "Solar array",
          recommendation: `${result.hybrid.recommendedSolarArrayW.toLocaleString()} W PV array`,
          rationale: `Based on ${project.sunHours} peak sun hour(s) and array derating. Covers daily energy plus reserve, not a guaranteed battery recharge time after cloudy days.`,
        },
        {
          category: "Inverter",
          recommendation: `${result.hybrid.recommendedInverterW.toLocaleString()} W inverter or hybrid inverter`,
          rationale: "Allows headroom above the running and expected surge load.",
        },
      ],
    },
  ];
}
