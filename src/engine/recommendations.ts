import type { CalculationResult, Project, SystemRecommendation } from "../types/project";

const formatKwh = (wh: number): string => `${(wh / 1000).toFixed(1)} kWh`;

export function buildRecommendations(project: Project, result: CalculationResult): SystemRecommendation[] {
  const acLoadCount = project.loads.filter((load) => load.currentType === "AC").length;
  const dcSummary =
    acLoadCount > 0
      ? "Best when AC devices can be replaced with DC equivalents or powered through small point-of-use adapters."
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
          recommendation: `${formatKwh(result.dc.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,
          rationale: `Sized for ${project.autonomyDays} autonomy day(s) at the configured depth of discharge.`,
        },
        {
          category: "Solar array",
          recommendation: `${result.dc.recommendedSolarArrayW.toLocaleString()} W PV array`,
          rationale: `Based on ${project.sunHours} average sun hour(s) with derating for real-world conditions.`,
        },
        {
          category: "Charge control",
          recommendation: `${result.dc.recommendedMpptCurrentA} A MPPT at ${project.systemVoltage} V`,
          rationale: "Controller current includes a safety factor above expected PV charging current.",
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
          recommendation: `${formatKwh(result.hybrid.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,
          rationale: `Sized for ${project.autonomyDays} autonomy day(s), including reserve and depth-of-discharge limits.`,
        },
        {
          category: "Solar array",
          recommendation: `${result.hybrid.recommendedSolarArrayW.toLocaleString()} W PV array`,
          rationale: `Based on ${project.sunHours} average sun hour(s), array derating, and storage recovery needs.`,
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
