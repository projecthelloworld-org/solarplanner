import { describe, expect, it } from "vitest";
import sample from "../data/sample-project.json";
import assumptions from "../data/assumptions.json";
import products from "../data/default-products.json";
import brands from "../data/brand-profiles.json";
import type { EngineeringSettings, LoadItem, ProductCatalog, Project } from "../types/project";
import { calculateProject } from "./calculations";
import { getProjectBundle } from "./planner";
import { inverterChecks, inverterRequirement, technicalChecks } from "./engineering";
import { evaluateEquipmentPlan } from "./equipment";
import { validateProject, validateEngineering } from "./validation";
import { buildProjectCsv, renderProjectReport } from "../exports/project-report";

const load = (override: Partial<LoadItem> = {}): LoadItem => ({ id: "x", name: "Load", quantity: 1, watts: 100, hoursPerDay: 2, currentType: "AC", voltage: 230, surgeMultiplier: 1, critical: false, ...override });
const site = (loads = [load()]): Project => ({ ...structuredClone(sample) as Project, name: "Mathias CN", country: "Nigeria", selectedSystem: "hybrid", sunHours: 6, loads });
const mathias = (voltage = 24) => site([
  load({ id: "tv", name: "TV", watts: 15, hoursPerDay: 5, voltage, surgeMultiplier: 1.1 }),
  load({ id: "freezer", name: "Deep freezer", watts: 20, hoursPerDay: 20, voltage, surgeMultiplier: 1.1, critical: true }),
  load({ id: "ac", name: "AC Unit", watts: 30, hoursPerDay: 6, voltage, surgeMultiplier: 1.1 }),
  load({ id: "lights", name: "Bulbs", quantity: 20, watts: 5, hoursPerDay: 5, voltage, surgeMultiplier: 1.1, critical: true }),
]);
const catalog = products as ProductCatalog;
function custom(project: Project, settings: EngineeringSettings = {}) {
  const plan = structuredClone(getProjectBundle(project, assumptions).plan);
  project.optionPlans = { [project.selectedSystem]: { mode: "custom", equipment: plan, pricingOverrides: {}, engineering: settings } };
  return plan;
}
function check(project: Project, label: string) {
  return getProjectBundle(project, assumptions).evaluation.checks.find((c) => c.label === label)!;
}

describe("accuracy review regression cases", () => {
  it("reproduces entered Mathias demand and flags its AC supply incompatibility", () => {
    const project = mathias();
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.result).toMatchObject({ totalDailyWh: 1155, peakLoadW: 165, surgeLoadW: 175, criticalDailyWh: 900 });
    expect(bundle.result.hybrid.adjustedDailyWh).toBe(1312.5);
    expect(bundle.plan.hybrid.inverterCount).toBe(0);
    expect(check(project, "AC supply compatibility").status).toBe("failed");
    expect(project.loads.every((l) => l.voltage === 24)).toBe(true);
  });
  it("uses manufacturer losses and a separate explicit manual override", () => {
    const project = mathias(230);
    let bundle = getProjectBundle(project, assumptions);
    expect(bundle.plan.hybrid.inverterProductId).toBe("inverter-24-300");
    expect(bundle.result.hybrid.adjustedDailyWh).toBeCloseTo(1358.8235294);
    expect(bundle.result.effectiveEfficiency?.source).toBe("manufacturer");
    project.inverterSettings = { mode: "manual", efficiency: .88 };
    bundle = getProjectBundle(project, assumptions);
    expect(bundle.result.hybrid.adjustedDailyWh).toBe(1312.5);
    expect(bundle.plan.shared.batteryCount).toBe(2);
    expect(bundle.evaluation.checks.find((c) => c.label === "MPPT/controller")?.required).toBe(23.4375);
  });
  it("does not purchase an extra battery because of display rounding", () => {
    const project = site([load({ hoursPerDay: 10.4 })]);
    project.inverterSettings = { mode: "manual", efficiency: .88 };
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.result.hybrid.requiredBatteryWh).toBeCloseTo(2548.2954545);
    expect(bundle.plan.shared.batteryCount).toBe(1);
    expect(bundle.actuals.batteryWh).toBe(2560);
  });
  it("generates and prices independent DC/hybrid equipment", () => {
    const project = site([load({ hoursPerDay: 10.5 })]);
    project.inverterSettings = { mode: "manual", efficiency: .88 };
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.options.dc.plan.shared.batteryCount).toBe(1);
    expect(bundle.options.hybrid.plan.shared.batteryCount).toBe(2);
    expect(bundle.options.dc.cost.totalUsd).toBeLessThan(bundle.options.hybrid.cost.totalUsd);
    project.optionPlans = { dc: { mode: "custom", equipment: structuredClone(bundle.options.dc.plan), pricingOverrides: { batteryUnitUsd: 123 } }, hybrid: { mode: "generated", pricingOverrides: { batteryUnitUsd: 456 } } };
    project.optionPlans.dc!.equipment!.shared.panelCount = 7;
    project.selectedSystem = "dc";
    expect(getProjectBundle(project, assumptions).plan.shared.panelCount).toBe(7);
    expect(getProjectBundle(project, assumptions).pricing.batteryUnitUsd).toBe(123);
    project.selectedSystem = "hybrid";
    expect(getProjectBundle(project, assumptions).pricing.batteryUnitUsd).toBe(456);
    expect(getProjectBundle(project, assumptions).plan.shared.panelCount).not.toBe(7);
  });
  it("adds unloaded energy once to hybrid only and distinguishes blank from zero", () => {
    const project = site();
    const base = getProjectBundle(project, assumptions);
    expect(check(project, "Inverter idle energy").status).toBe("unverified");
    project.inverterSettings = { mode: "manufacturer", unloadedHoursPerDay: 3 };
    let bundle = getProjectBundle(project, assumptions);
    expect(bundle.result.hybrid.adjustedDailyWh - base.result.hybrid.adjustedDailyWh).toBeCloseTo(28.8);
    expect(bundle.result.dc.adjustedDailyWh).toBe(base.result.dc.adjustedDailyWh);
    expect(check(project, "Inverter idle energy").status).toBe("passed");
    project.inverterSettings.unloadedHoursPerDay = 0;
    bundle = getProjectBundle(project, assumptions);
    expect(bundle.result.idleDailyWh).toBe(0);
    expect(check(project, "Inverter idle energy").status).toBe("passed");
    project.inverterSettings.unloadedHoursPerDay = 24;
    expect(validateProject(project).some((v) => v.path.includes("unloadedHours"))).toBe(true);
  });
  it("counts idle draw for each explicitly installed inverter", () => {
    const project = site();
    project.inverterSettings = { mode: "manufacturer", unloadedHoursPerDay: 3 };
    const plan = custom(project);
    plan.hybrid.inverterCount = 2;
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.result.idleDailyWh).toBeCloseTo(57.6);
    expect(bundle.result.effectiveEfficiency?.value).toBe(.85);
  });
  it("honors startup VA even without an increase in real watts", () => {
    const project = site([load({ powerFactor: 1, startupVA: 400, startupSeconds: 2 })]);
    expect(calculateProject(project, assumptions).inverterDemand?.events[0]).toMatchObject({ watts: 100, voltAmps: 400, durationSeconds: 2 });
  });
  it("supports unnamed rows, named groups and all-load restart", () => {
    const project = site([load({ id: "a", surgeMultiplier: 5 }), load({ id: "b", surgeMultiplier: 5 })]);
    expect(calculateProject(project, assumptions).acSurgeLoadW).toBe(600);
    project.loads.forEach((l) => l.startupGroup = "motors");
    expect(calculateProject(project, assumptions).acSurgeLoadW).toBe(1000);
    project.loads.forEach((l) => l.startupGroup = undefined);
    project.startupMode = "all";
    expect(calculateProject(project, assumptions).acSurgeLoadW).toBe(1000);
  });
  it("credits verified startup ratings only with matching W, VA and duration", () => {
    const project = site([load({ powerFactor: .8, startupVA: 625, startupSeconds: 2, surgeMultiplier: 5, frequencyHz: 50 })]);
    const result = calculateProject(project, assumptions);
    const inverter = { ...catalog.hybridInverters.find((p) => p.id === "inverter-24-300")!, continuousVA: 350, surgeVA: 700, surgeW: 600, surgeSeconds: 3 };
    expect(inverterRequirement(result, inverter)).toBe(125);
    expect(inverterChecks(result, inverter, project).some((c) => c.status !== "passed")).toBe(false);
    expect(inverterRequirement(result, { ...inverter, surgeSeconds: 1 })).toBe(500);
    expect(inverterRequirement(result, { ...inverter, surgeVA: undefined })).toBe(500);
    expect(inverterChecks(result, { ...inverter, continuousVA: 100 }, project).find((c) => c.label === "Inverter continuous VA")?.status).toBe("failed");
  });
  it("rejects known frequency conflicts and accepts an explicitly supported voltage range", () => {
    const project = site([load({ voltage: 220, voltageMin: 220, voltageMax: 240, frequencyHz: 60 })]);
    const inv = catalog.hybridInverters.find((p) => p.id === "inverter-24-300")!;
    const checks = inverterChecks(calculateProject(project, assumptions), inv, project);
    expect(checks.find((c) => c.label.includes("AC voltage"))?.status).toBe("passed");
    expect(checks.find((c) => c.label.includes("AC frequency"))?.status).toBe("failed");
  });
  it("uses minimum bank voltage and preserves incomplete nominal screening", () => {
    const project = site([load({ watts: 1120, hoursPerDay: .1, currentType: "DC", voltage: 24 })]);
    project.selectedSystem = "dc";
    const plan = custom(project, { battery: { minimumVoltage: 22.4 } });
    plan.shared = { ...plan.shared, batteryProductId: "bat-24-50", batteryCount: 1, batteryVoltage: 25.6, batteryAh: 50 };
    expect(check(project, "Battery continuous current").status).toBe("failed");
    project.optionPlans!.dc!.engineering = {};
    expect(check(project, "Battery continuous current").status).toBe("unverified");
  });
  it("checks charging current and charge/float settings independently", () => {
    const project = site();
    custom(project, { battery: { maxChargeA: 10 }, controller: { chargeVoltage: 27, floatVoltage: 27 } });
    expect(check(project, "Battery charge current").status).toBe("failed");
    // Use the exact native battery reference, not the smaller generic battery.
    const plan = project.optionPlans!.hybrid!.equipment!;
    plan.shared = { ...plan.shared, batteryProductId: "bat-2560", batteryCount: 1, batteryVoltage: 25.6, batteryAh: 100 };
    expect(check(project, "Battery charge setting").status).toBe("failed");
    project.optionPlans!.hybrid!.engineering!.controller = { chargeVoltage: 28.8, floatVoltage: 28.8 };
    expect(check(project, "Battery charge setting").status).toBe("passed");
  });
  it("checks cold Voc, hot/cold Vmp, input Isc and controller allocation", () => {
    const project = site(); project.selectedSystem = "dc";
    const settings: EngineeringSettings = { minimumCellTemperatureC: 0, maximumCellTemperatureC: 70, panel: { voc: 40, vmp: 32, isc: 12, vocTemperatureCoefficient: -.3, vmpTemperatureCoefficient: -.4, iscTemperatureCoefficient: .05 }, controller: { maxPvVoltage: 80, minMpptVoltage: 20, maxMpptVoltage: 70, maxPvInputA: 20, mpptInputs: 1 }, pvAssignments: [{ target: "separate", controllerIndex: 1, input: 1, series: 2, parallel: 1 }] };
    const plan = custom(project, settings);
    plan.shared.panelCount = 2;
    expect(check(project, "PV array allocation").status).toBe("passed");
    expect(check(project, "PV input 1 cold Voc").status).toBe("failed");
    expect(check(project, "PV input 1 maximum Vmp").status).toBe("failed");
    expect(check(project, "PV input 1 design Isc").status).toBe("passed");
    settings.pvAssignments![0].series = 1;
    settings.pvAssignments![0].parallel = 2;
    expect(check(project, "PV input 1 design Isc").status).toBe("failed");
    settings.controller!.minMpptVoltage = 30;
    expect(check(project, "PV input 1 minimum Vmp").status).toBe("failed");
    settings.panel!.vmpTemperatureCoefficient = undefined;
    expect(check(project, "PV input 1 minimum Vmp").status).toBe("unverified");
    settings.pvAssignments!.push({ ...settings.pvAssignments![0] });
    expect(check(project, "PV input 2 assignment").status).toBe("failed");
    expect(check(project, "PV array allocation").status).toBe("failed");
  });
  it("does not treat a known PV power violation as merely unknown", () => {
    const project = site(); const plan = custom(project);
    plan.shared.panelCount = 20;
    expect(check(project, "Controller aggregate PV input power").status).toBe("failed");
  });
  it("exports assumptions, precision, check states and manual evidence consistently", () => {
    const project = mathias(230);
    custom(project, { inverter: { outputFrequencyHz: 50 } });
    const csv = buildProjectCsv(project, assumptions, brands);
    const html = renderProjectReport(project, assumptions, brands);
    for (const value of [csv, html]) {
      expect(value).toContain("1358.82352941");
      expect(value).toContain("manufacturer");
      expect(value).toContain("unverified");
      expect(value).toContain("User override");
      expect(value).toContain("Calculation revision");
      expect(value).toContain("No direct DC appliance loads are listed");
    }
  });
  it("rejects invalid optional details without inventing defaults", () => {
    const project = site([load({ powerFactor: 0, voltageMin: 250, voltageMax: 200, startupVA: 10 })]);
    expect(validateProject(project).map((v) => v.path)).toEqual(expect.arrayContaining(["loads.0.powerFactor", "loads.0.voltageMin", "loads.0.startupVA"]));
    expect(validateEngineering({ minimumCellTemperatureC: 80, maximumCellTemperatureC: 20, pvIscFactor: 0 }).length).toBe(2);
  });
});
