import type { Assumptions, CalculationResult, LoadCalculation, Project, StartupEvent, SystemSizing } from "../types/project";

const safeNumber = (value: number, fallback = 0): number => Number.isFinite(value) ? value : fallback;

export function calculateLoadRows(project: Project): LoadCalculation[] {
  return project.loads.map((load) => {
    const quantity = Math.floor(Math.max(0, safeNumber(load.quantity)));
    const watts = Math.max(0, safeNumber(load.watts));
    const hours = Math.min(24, Math.max(0, safeNumber(load.hoursPerDay)));
    const runningWatts = hours > 0 ? quantity * watts : 0;
    return { load, runningWatts, dailyWh: runningWatts * hours, surgeWatts: runningWatts * Math.max(1, safeNumber(load.surgeMultiplier, 1)) };
  });
}

/** One row starts at a time unless rows explicitly share a group, or all restart. */
export function startupEvents(rows: LoadCalculation[], mode: Project["startupMode"] = "groups"): StartupEvent[] {
  const active = rows.filter((row) => row.runningWatts > 0);
  const groups = new Map<string, LoadCalculation[]>();
  active.forEach((row, index) => {
    const key = mode === "all" ? "all" : row.load.startupGroup?.trim() ? `group:${row.load.startupGroup.trim()}` : `row:${index}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  return [...groups.values()].map((group) => {
    const starting = new Set(group);
    const powers = active.map((row) => starting.has(row) ? row.surgeWatts : row.runningWatts);
    const vas = active.map((row) => starting.has(row) && (row.load.surgeMultiplier > 1 || row.load.startupVA !== undefined)
      ? row.load.startupVA === undefined ? undefined : row.load.quantity * row.load.startupVA
      : row.load.powerFactor === undefined ? undefined : row.runningWatts / row.load.powerFactor);
    const durations = group.filter((row) => row.load.surgeMultiplier > 1 || row.load.startupVA !== undefined).map((row) => row.load.startupSeconds);
    return {
      watts: powers.reduce((a, b) => a + b, 0),
      voltAmps: vas.every((v) => v !== undefined) ? vas.reduce<number>((a, b) => a + b!, 0) : undefined,
      durationSeconds: durations.every((v) => v !== undefined) ? Math.max(0, ...durations as number[]) : undefined,
    };
  });
}

function sizeSystem(energy: number, runningW: number, surgeW: number, project: Project, assumptions: Assumptions, inverter: boolean): SystemSizing {
  const solar = energy / Math.max(0.5, project.sunHours) / assumptions.arrayDerateFactor * assumptions.batteryReserveFactor;
  return {
    adjustedDailyWh: energy,
    requiredBatteryWh: energy * Math.max(0.5, project.autonomyDays) * assumptions.batteryReserveFactor / assumptions.batteryDepthOfDischarge,
    recommendedSolarArrayW: solar,
    recommendedMpptCurrentA: solar / Math.max(12, project.systemVoltage) * assumptions.mpptSafetyFactor,
    recommendedInverterW: inverter ? Math.max(runningW * assumptions.inverterHeadroomFactor, surgeW) : 0,
  };
}

export interface EnergyContext {
  efficiency?: number;
  source?: "manual" | "manufacturer" | "fallback";
  productId?: string;
  noLoadWatts?: number;
  inverterPresent?: boolean;
}

export function calculateProject(project: Project, assumptions: Assumptions, context: EnergyContext = {}): CalculationResult {
  const rows = calculateLoadRows(project);
  const ac = rows.filter((row) => row.load.currentType === "AC" && row.runningWatts > 0);
  const totalDailyWh = rows.reduce((s, r) => s + r.dailyWh, 0);
  const peakLoadW = rows.reduce((s, r) => s + r.runningWatts, 0);
  const acPeakLoadW = ac.reduce((s, r) => s + r.runningWatts, 0);
  const acEvents = startupEvents(ac, project.startupMode);
  const acSurgeLoadW = Math.max(0, ...acEvents.map((e) => e.watts));
  const manual = project.inverterSettings?.mode === "manual" ? project.inverterSettings.efficiency : undefined;
  const efficiency = manual ?? context.efficiency ?? assumptions.inverterEfficiency;
  const idleDailyWh = context.inverterPresent ? (context.noLoadWatts ?? 0) * (project.inverterSettings?.unloadedHoursPerDay ?? 0) : 0;
  const hybridWh = rows.reduce((s, r) => s + r.dailyWh / (r.load.currentType === "AC" ? efficiency : assumptions.hybridDcEfficiency), idleDailyWh);
  return {
    loadRows: rows, totalDailyWh, peakLoadW,
    surgeLoadW: Math.max(0, ...startupEvents(rows, project.startupMode).map((e) => e.watts)),
    acPeakLoadW, acSurgeLoadW,
    criticalDailyWh: rows.filter((r) => r.load.critical).reduce((s, r) => s + r.dailyWh, 0),
    dc: sizeSystem(totalDailyWh / assumptions.dcDistributionEfficiency, 0, 0, project, assumptions, false),
    hybrid: sizeSystem(hybridWh, acPeakLoadW, acSurgeLoadW, project, assumptions, true),
    inverterDemand: {
      continuousW: acPeakLoadW * assumptions.inverterHeadroomFactor,
      continuousVA: ac.every((r) => r.load.powerFactor !== undefined) ? ac.reduce((s, r) => s + r.runningWatts / r.load.powerFactor!, 0) * assumptions.inverterHeadroomFactor : undefined,
      events: acEvents,
    },
    effectiveEfficiency: { value: efficiency, source: manual !== undefined ? "manual" : context.source ?? "fallback", productId: context.productId },
    idleDailyWh,
  };
}
