import type { AdequacyCheck, Assumptions, CalculationResult, ElectricalRatings, EngineeringSettings, EquipmentPlan, ProductCatalog, ProductItem, Project, SystemOptionId } from "../types/project";
import { startupEvents } from "./calculations";

export const CALCULATION_REVISION = "2.1";
export const engineeringFor = (project: Project, option: SystemOptionId): EngineeringSettings => project.optionPlans?.[option]?.engineering ?? {};
export function withRatings<T extends ElectricalRatings>(base: T | undefined, override?: ElectricalRatings): T & ElectricalRatings {
  return { ...base, ...Object.fromEntries(Object.entries(override ?? {}).filter(([, v]) => v !== undefined)) } as T & ElectricalRatings;
}
export const comparisonTolerance = (a: number, b: number) => 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
export const atLeast = (actual: number, required: number) => actual + comparisonTolerance(actual, required) >= required;
export function engineeringCheck(label: string, status: "passed" | "failed" | "unverified", detail: string, actual = 0, required = 0, unit = ""): AdequacyCheck {
  return { label, status, passed: status === "passed", detail, actual, required, unit, warning: status === "failed" ? detail : undefined };
}
const limitCheck = (label: string, actual: number | undefined, limit: number | undefined, unit: string): AdequacyCheck => {
  if (actual === undefined || limit === undefined) return engineeringCheck(label, "unverified", `${label}: demand or documented limit is missing.`);
  return engineeringCheck(label, atLeast(limit, actual) ? "passed" : "failed", `${label}: ${actual.toFixed(2)} ${unit} demand; ${limit.toFixed(2)} ${unit} limit.`, limit, actual, unit);
};

export function inverterRequirement(result: CalculationResult, inverter?: ProductItem): number {
  const demand = result.inverterDemand;
  if (!demand) return result.hybrid.recommendedInverterW;
  const canUseSurge = (event: typeof demand.events[number]) => inverter && event.durationSeconds !== undefined && event.voltAmps !== undefined
    && inverter.surgeW !== undefined && inverter.surgeVA !== undefined && inverter.surgeSeconds !== undefined
    && atLeast(inverter.surgeW, event.watts) && atLeast(inverter.surgeVA, event.voltAmps) && atLeast(inverter.surgeSeconds, event.durationSeconds);
  return Math.max(demand.continuousW, ...demand.events.map((e) => canUseSurge(e) ? 0 : e.watts));
}

export function inverterChecks(result: CalculationResult, inverter: ProductItem | undefined, project: Project): AdequacyCheck[] {
  const ac = result.loadRows.filter((r) => r.load.currentType === "AC" && r.runningWatts > 0);
  if (!ac.length) return [];
  if (!inverter) return [engineeringCheck("Inverter specification", "unverified", "No compatible single inverter is selected; AC output and power ratings are unverified.")];
  const checks: AdequacyCheck[] = [];
  checks.push(engineeringCheck("Inverter DC input", inverter.systemVoltage === project.systemVoltage ? "passed" : "failed", `Inverter input ${inverter.systemVoltage ?? "unknown"} V; battery bus ${project.systemVoltage} V.`));
  for (const { load } of ac) {
    const lower = load.voltageMin ?? load.voltage;
    const upper = load.voltageMax ?? load.voltage;
    checks.push(engineeringCheck(`${load.name}: AC voltage`, inverter.outputVoltage === undefined ? "unverified" : inverter.outputVoltage >= lower && inverter.outputVoltage <= upper ? "passed" : "failed",
      `${load.name}: entered supply ${lower === upper ? lower : `${lower}–${upper}`} V AC; inverter output ${inverter.outputVoltage ?? "unknown"} V AC.`));
    checks.push(engineeringCheck(`${load.name}: AC frequency`, load.frequencyHz === undefined || inverter.outputFrequencyHz === undefined ? "unverified" : load.frequencyHz === inverter.outputFrequencyHz ? "passed" : "failed",
      `${load.name}: frequency ${load.frequencyHz ?? "not entered"} Hz; inverter ${inverter.outputFrequencyHz ?? "unknown"} Hz.`));
  }
  const requirement = inverterRequirement(result, inverter);
  checks.push(limitCheck("Inverter continuous watts", requirement, inverter.watts, "W"));
  checks.push(limitCheck("Inverter continuous VA", result.inverterDemand?.continuousVA, inverter.continuousVA, "VA"));
  for (const [i, event] of (result.inverterDemand?.events ?? []).entries()) {
    const continuous = inverter.watts !== undefined && atLeast(inverter.watts, event.watts) && event.voltAmps !== undefined && inverter.continuousVA !== undefined && atLeast(inverter.continuousVA, event.voltAmps);
    const complete = event.voltAmps !== undefined && event.durationSeconds !== undefined && inverter.surgeW !== undefined && inverter.surgeVA !== undefined && inverter.surgeSeconds !== undefined;
    const passes = complete && atLeast(inverter.surgeW!, event.watts) && atLeast(inverter.surgeVA!, event.voltAmps!) && atLeast(inverter.surgeSeconds!, event.durationSeconds!);
    checks.push(engineeringCheck(`Inverter startup ${i + 1}`, continuous || passes ? "passed" : complete ? "failed" : "unverified",
      `Startup ${i + 1}: ${event.watts.toFixed(2)} W, ${event.voltAmps?.toFixed(2) ?? "unknown"} VA, ${event.durationSeconds ?? "unknown"} s. ${continuous ? "Covered by continuous ratings." : "Short-term capacity requires verified W, VA and duration."}`));
  }
  return checks;
}

export function batteryDemand(result: CalculationResult, system: SystemOptionId, assumptions: Assumptions) {
  const efficiency = result.effectiveEfficiency?.value ?? assumptions.inverterEfficiency;
  const rows = result.loadRows.map((r) => {
    const conversion = system === "dc" ? assumptions.dcDistributionEfficiency : r.load.currentType === "AC" ? efficiency : assumptions.hybridDcEfficiency;
    return { ...r, runningWatts: r.runningWatts / conversion, surgeWatts: r.surgeWatts / conversion };
  });
  return { rows, runningW: rows.reduce((s, r) => s + r.runningWatts, 0) };
}

export function technicalChecks(result: CalculationResult, plan: EquipmentPlan, system: SystemOptionId, project: Project, assumptions: Assumptions, catalog: ProductCatalog): AdequacyCheck[] {
  if (!result.loadRows.some((r) => r.runningWatts > 0)) return [];
  const settings = engineeringFor(project, system);
  const batteryRef = catalog.batteries.find((p) => p.id === plan.shared.batteryProductId && p.voltage === plan.shared.batteryVoltage && p.ampHours === plan.shared.batteryAh);
  const inverterRef = catalog.hybridInverters.find((p) => p.id === plan.hybrid.inverterProductId && p.watts === plan.hybrid.inverterWatts);
  const control = system === "dc" ? plan.dc : plan.hybrid;
  const controllerRef = catalog.chargeControllers.find((p) => p.id === control.controllerProductId && p.amps === control.mpptAmps);
  const panelRef = catalog.solarPanels.find((p) => p.id === plan.shared.panelProductId && p.watts === plan.shared.panelWatts);
  const battery = withRatings(batteryRef, settings.battery);
  const inverter = inverterRef ? withRatings(inverterRef, settings.inverter) : undefined;
  const controller = withRatings(controllerRef, settings.controller);
  const panel = withRatings(panelRef, settings.panel);
  const nominal = (v: number) => ({ 12.8: 12, 25.6: 24, 51.2: 48 }[v] ?? v);
  const series = project.systemVoltage / nominal(plan.shared.batteryVoltage);
  const topology = Number.isInteger(series) && series >= 1 && plan.shared.batteryCount > 0 && plan.shared.batteryCount % series === 0;
  const strings = topology ? plan.shared.batteryCount / series : 0;
  const checks: AdequacyCheck[] = [];
  checks.push(engineeringCheck("Battery topology", !topology ? "failed" : series > 1 && battery.maxSeries === undefined || strings > 1 && battery.maxParallel === undefined ? "unverified" : series > (battery.maxSeries ?? 1) || strings > (battery.maxParallel ?? 1) ? "failed" : "passed", `Battery bank: ${series} units per string; ${strings} parallel strings. Series/parallel approval must match the battery revision.`));
  const minimumV = battery.minimumVoltage === undefined || !topology ? undefined : battery.minimumVoltage * series;
  const demand = batteryDemand(result, system, assumptions);
  checks.push(engineeringCheck("Battery minimum operating voltage", minimumV === undefined ? "unverified" : "passed", minimumV === undefined ? `Minimum operating voltage is unknown; nominal screening uses ${project.systemVoltage} V.` : `Current checks use ${minimumV} V minimum bank voltage.`));
  checks.push(limitCheck("Battery continuous current", demand.runningW / (minimumV ?? project.systemVoltage), topology && battery.continuousDischargeA !== undefined ? battery.continuousDischargeA * strings : undefined, "A"));
  if (minimumV === undefined && checks[checks.length - 1]?.status === "passed") { checks[checks.length - 1]!.status = "unverified"; checks[checks.length - 1]!.passed = false; checks[checks.length - 1]!.detail += " Nominal-voltage screening only."; }
  checks.push(limitCheck("Battery continuous power", demand.runningW, topology && battery.continuousDischargeW !== undefined ? battery.continuousDischargeW * plan.shared.batteryCount : undefined, "W"));
  const events = startupEvents(demand.rows, project.startupMode);
  for (const [i, event] of events.entries()) {
    const amps = event.watts / (minimumV ?? project.systemVoltage);
    const continuous = topology && minimumV !== undefined && battery.continuousDischargeA !== undefined && battery.continuousDischargeW !== undefined && atLeast(battery.continuousDischargeA * strings, amps) && atLeast(battery.continuousDischargeW * plan.shared.batteryCount, event.watts);
    const complete = topology && minimumV !== undefined && battery.startupDischargeA !== undefined && battery.startupDischargeW !== undefined && battery.startupDischargeSeconds !== undefined && event.durationSeconds !== undefined;
    const passes = complete && atLeast(battery.startupDischargeA! * strings, amps) && atLeast(battery.startupDischargeW! * plan.shared.batteryCount, event.watts) && atLeast(battery.startupDischargeSeconds!, event.durationSeconds!);
    checks.push(engineeringCheck(`Battery startup ${i + 1}`, continuous || passes ? "passed" : complete ? "failed" : "unverified", `Battery startup ${i + 1}: ${amps.toFixed(2)} A, ${event.watts.toFixed(2)} W, ${event.durationSeconds ?? "unknown"} s; operating limits are distinct from BMS trip thresholds.`));
  }
  const integrated = system === "hybrid" && plan.hybrid.inverterCount === 1 ? inverter?.integratedMpptA ?? 0 : 0;
  const chargeA = control.controllerCount * control.mpptAmps + integrated;
  checks.push(limitCheck("Battery charge current", chargeA, topology && battery.maxChargeA !== undefined ? battery.maxChargeA * strings : undefined, "A"));
  checks.push(limitCheck("Battery charge power", battery.chargeVoltage === undefined ? undefined : chargeA * battery.chargeVoltage * series, topology && battery.maxChargeW !== undefined ? battery.maxChargeW * plan.shared.batteryCount : undefined, "W"));
  for (const field of ["chargeVoltage", "floatVoltage"] as const) {
    const target = battery[field] === undefined ? undefined : battery[field]! * series;
    const sources = [...(control.controllerCount ? [controller] : []), ...(integrated ? [inverter!] : [])];
    checks.push(engineeringCheck(`Battery ${field === "chargeVoltage" ? "charge" : "float"} setting`, target === undefined || !sources.length || sources.some((s) => s[field] === undefined) ? "unverified" : sources.every((s) => Math.abs(s[field]! - target) < 0.01) ? "passed" : "failed", `Required bank setting: ${target ?? "unknown"} V; controller settings: ${sources.map((s) => s[field] ?? "unknown").join(", ")} V.`));
  }
  if (system === "hybrid") {
    checks.push(...inverterChecks(result, inverter, project));
    if (result.acPeakLoadW > 0 || plan.hybrid.inverterCount > 0) {
      const hours = project.inverterSettings?.unloadedHoursPerDay;
      const idleWatts = settings.inverter?.noLoadWatts ?? inverter?.noLoadWatts;
      checks.push(engineeringCheck("Inverter idle energy", hours === undefined || hours > 0 && (idleWatts === undefined || plan.hybrid.inverterCount < 1) ? "unverified" : "passed", hours === undefined ? "Unloaded operating hours are not entered; idle energy is omitted." : hours === 0 ? "Explicitly zero unloaded hours; no idle energy added." : `Unloaded ${hours} h/day × ${idleWatts ?? "unknown"} W × ${plan.hybrid.inverterCount} inverter(s); idle energy ${result.idleDailyWh?.toFixed(2) ?? 0} Wh/day, added once.`));
    }
  }
  const assignments = settings.pvAssignments ?? [];
  const assignedPanels = assignments.reduce((sum, a) => sum + a.series * a.parallel, 0);
  checks.push(engineeringCheck("PV array allocation", !assignments.length ? "unverified" : assignedPanels === plan.shared.panelCount ? "passed" : "failed", `Assigned ${assignedPanels} of ${plan.shared.panelCount} panels to controller inputs.`));
  const used = new Set<string>();
  const controllerPower = new Map<string, number>();
  for (const [index, a] of assignments.entries()) {
    const label = `PV input ${index + 1}`;
    const c = a.target === "integrated" ? inverter : controller;
    const count = a.target === "integrated" ? integrated > 0 ? 1 : 0 : control.controllerCount;
    const key = `${a.target}:${a.controllerIndex}:${a.input}`;
    const exists = a.controllerIndex >= 1 && a.controllerIndex <= count && a.input >= 1 && a.series >= 1 && a.parallel >= 1 && !used.has(key);
    used.add(key);
    checks.push(engineeringCheck(`${label} assignment`, !exists || c?.mpptInputs !== undefined && a.input > c.mpptInputs ? "failed" : c?.mpptInputs === undefined ? "unverified" : "passed", `${label}: ${a.series} series × ${a.parallel} parallel on ${a.target} controller ${a.controllerIndex}, input ${a.input}.`));
    const temperature = settings.minimumCellTemperatureC !== undefined && settings.maximumCellTemperatureC !== undefined;
    const corrected = (v: number | undefined, coefficient: number | undefined, which: "min" | "max") => {
      if (v === undefined || coefficient === undefined || !temperature) return undefined;
      const values = [settings.minimumCellTemperatureC!, settings.maximumCellTemperatureC!].map((t) => v * (1 + coefficient / 100 * (t - 25)));
      return which === "max" ? Math.max(...values) : Math.min(...values);
    };
    const voc = corrected(panel.voc, panel.vocTemperatureCoefficient, "max");
    const hotVmp = corrected(panel.vmp, panel.vmpTemperatureCoefficient, "min");
    const coldVmp = corrected(panel.vmp, panel.vmpTemperatureCoefficient, "max");
    const isc = corrected(panel.isc, panel.iscTemperatureCoefficient, "max");
    checks.push(limitCheck(`${label} cold Voc`, voc === undefined ? undefined : voc * a.series, c?.maxPvVoltage, "V"));
    checks.push(limitCheck(`${label} maximum Vmp`, coldVmp === undefined ? undefined : coldVmp * a.series, c?.maxMpptVoltage, "V"));
    const trackingMin = c?.minMpptVoltage ?? (c?.mpptBatteryHeadroomV !== undefined && battery.chargeVoltage !== undefined ? battery.chargeVoltage * series + c.mpptBatteryHeadroomV : undefined);
    checks.push(limitCheck(`${label} minimum Vmp`, trackingMin, hotVmp === undefined ? undefined : hotVmp * a.series, "V"));
    checks.push(limitCheck(`${label} design Isc`, isc === undefined ? undefined : isc * a.parallel * (settings.pvIscFactor ?? 1.25), c?.maxPvInputA, "A"));
    const device = `${a.target}:${a.controllerIndex}`;
    controllerPower.set(device, (controllerPower.get(device) ?? 0) + a.series * a.parallel * plan.shared.panelWatts);
  }
  for (const [target, watts] of controllerPower) {
    const c = target.startsWith("integrated") ? inverter : controller;
    checks.push(limitCheck(`PV power ${target}`, watts, c?.maxPvWatts ?? c?.pvWattsByVoltage?.[String(project.systemVoltage)], "W"));
  }
  return checks;
}
