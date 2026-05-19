import type { Assumptions, CalculationResult, LoadCalculation, Project, SystemSizing } from "../types/project";

const roundUpTo = (value: number, step: number): number => Math.ceil(value / step) * step;

const safeNumber = (value: number, fallback = 0): number => (Number.isFinite(value) ? value : fallback);

export function calculateLoadRows(project: Project): LoadCalculation[] {
  return project.loads.map((load) => {
    const quantity = Math.max(0, safeNumber(load.quantity));
    const watts = Math.max(0, safeNumber(load.watts));
    const hoursPerDay = Math.max(0, safeNumber(load.hoursPerDay));
    const surgeMultiplier = Math.max(1, safeNumber(load.surgeMultiplier, 1));
    const runningWatts = quantity * watts;

    return {
      load,
      runningWatts,
      dailyWh: runningWatts * hoursPerDay,
      surgeWatts: runningWatts * surgeMultiplier,
    };
  });
}

function sizeSystem(
  adjustedDailyWh: number,
  peakLoadW: number,
  surgeLoadW: number,
  project: Project,
  assumptions: Assumptions,
  includeInverter: boolean,
): SystemSizing {
  const autonomyDays = Math.max(0.5, project.autonomyDays);
  const sunHours = Math.max(0.5, project.sunHours);
  const systemVoltage = Math.max(12, project.systemVoltage);
  const requiredBatteryWh =
    (adjustedDailyWh * autonomyDays * assumptions.batteryReserveFactor) / assumptions.batteryDepthOfDischarge;
  const recommendedSolarArrayW = (adjustedDailyWh / sunHours / assumptions.arrayDerateFactor) * assumptions.batteryReserveFactor;
  const recommendedMpptCurrentA = (recommendedSolarArrayW / systemVoltage) * assumptions.mpptSafetyFactor;
  const inverterBase = Math.max(peakLoadW, surgeLoadW * 0.55);

  return {
    adjustedDailyWh: Math.round(adjustedDailyWh),
    requiredBatteryWh: roundUpTo(requiredBatteryWh, 100),
    recommendedSolarArrayW: roundUpTo(recommendedSolarArrayW, 10),
    recommendedMpptCurrentA: roundUpTo(recommendedMpptCurrentA, 5),
    recommendedInverterW: includeInverter ? roundUpTo(inverterBase * assumptions.inverterHeadroomFactor, 100) : 0,
  };
}

export function calculateProject(project: Project, assumptions: Assumptions): CalculationResult {
  const loadRows = calculateLoadRows(project);
  const totalDailyWh = loadRows.reduce((sum, row) => sum + row.dailyWh, 0);
  const peakLoadW = loadRows.reduce((sum, row) => sum + row.runningWatts, 0);
  const surgeLoadW = Math.max(0, ...loadRows.map((row) => peakLoadW - row.runningWatts + row.surgeWatts));
  const criticalDailyWh = loadRows.filter((row) => row.load.critical).reduce((sum, row) => sum + row.dailyWh, 0);
  const dcAdjustedWh = totalDailyWh / assumptions.dcDistributionEfficiency;
  const hybridAdjustedWh = loadRows.reduce((sum, row) => {
    const efficiency = row.load.currentType === "AC" ? assumptions.inverterEfficiency : assumptions.hybridDcEfficiency;
    return sum + row.dailyWh / efficiency;
  }, 0);

  return {
    loadRows,
    totalDailyWh: Math.round(totalDailyWh),
    peakLoadW: Math.round(peakLoadW),
    surgeLoadW: Math.round(surgeLoadW),
    criticalDailyWh: Math.round(criticalDailyWh),
    dc: sizeSystem(dcAdjustedWh, peakLoadW, surgeLoadW, project, assumptions, false),
    hybrid: sizeSystem(hybridAdjustedWh, peakLoadW, surgeLoadW, project, assumptions, true),
  };
}
