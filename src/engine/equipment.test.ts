import { describe, expect, it } from "vitest";
import type { CalculationResult, EquipmentPlan } from "../types/project";
import { evaluateEquipmentPlan, getEquipmentActuals } from "./equipment";
import { generateEquipmentPlan } from "./equipment";
import { calculateProject } from "./calculations";
import sample from "../data/sample-project.json";
import assumptions from "../data/assumptions.json";
import type { Project } from "../types/project";

const project = sample as Project;

const plan: EquipmentPlan = {
  shared: { panelCount: 2, panelWatts: 450, batteryCount: 2, batteryVoltage: 24, batteryAh: 100 },
  dc: { controllerCount: 2, mpptAmps: 30 },
  hybrid: { controllerCount: 3, mpptAmps: 20, inverterCount: 1, inverterWatts: 500 },
  balance: { dcDistributionCount: 1, acDistributionCount: 1, cablingCount: 1, earthingCount: 1, monitoringCount: 1 },
};

const result = {
  ...calculateProject(project, assumptions),
  dc: { adjustedDailyWh: 1_000, requiredBatteryWh: 4_000, recommendedSolarArrayW: 800, recommendedMpptCurrentA: 55, recommendedInverterW: 0 },
  hybrid: { adjustedDailyWh: 1_000, requiredBatteryWh: 4_000, recommendedSolarArrayW: 800, recommendedMpptCurrentA: 55, recommendedInverterW: 500 },
} as CalculationResult;

describe("equipment capacity checks", () => {
  it("counts the combined capacity of multiple controllers", () => {
    const actuals = getEquipmentActuals(plan);
    expect(actuals.dcMpptA).toBe(60);
    expect(actuals.hybridMpptA).toBe(60);
  });

  it("uses cautious preliminary status language", () => {
    const demand = calculateProject({ ...project, loads: [project.loads[0]] }, assumptions);
    const quoted = { ...project, pricing: { ...project.pricing, controllerUnitUsd: 120 } };
    expect(evaluateEquipmentPlan(demand, plan, "dc", quoted, assumptions).status).toBe("Needs attention");
    expect(evaluateEquipmentPlan(demand, plan, "dc", quoted, assumptions).warnings.join(" ")).toContain("unverified");
    const undersized = structuredClone(plan);
    undersized.shared.panelCount = 1;
    expect(evaluateEquipmentPlan(result, undersized, "dc", project, assumptions).status).toBe("Needs attention");
  });

  it("sizes controllers for installed panels and rechecks manual array increases", () => {
    const demand = calculateProject(project, assumptions);
    const generated = generateEquipmentPlan(demand, project.equipmentDefaults, project, assumptions);
    expect(generated.dc.controllerCount * generated.dc.mpptAmps).toBeGreaterThanOrEqual(generated.shared.panelCount * generated.shared.panelWatts / 24 * 1.25);
    generated.shared.panelCount = 20;
    const evaluation = evaluateEquipmentPlan(demand, generated, "hybrid", project, assumptions);
    expect(evaluation.warnings.some((warning) => warning.startsWith("MPPT/controller"))).toBe(true);
    expect(evaluation.checks[2].required).toBe(470);
  });

  it("uses complete battery strings and flags incompatible edited banks", () => {
    const site = { ...project, systemVoltage: 48 };
    const demand = calculateProject(site, assumptions);
    const generated = generateEquipmentPlan(demand, { ...site.equipmentDefaults, batteryVoltage: 12.8 }, site, assumptions);
    expect(generated.shared.batteryVoltage).toBe(51.2);
    generated.shared.batteryVoltage = 12.8;
    generated.shared.batteryCount = 5;
    expect(evaluateEquipmentPlan(demand, generated, "hybrid", site, assumptions).warnings.join(" ")).toContain("complete strings");
    generated.shared.batteryVoltage = 96;
    expect(evaluateEquipmentPlan(demand, generated, "hybrid", site, assumptions).warnings.join(" ")).toContain("complete strings");
  });

  it("leaves unsupported inverter requirements unresolved instead of inventing products", () => {
    const demand = calculateProject({ ...project, loads: [{ ...project.loads[0], currentType: "AC", watts: 2400 }] }, assumptions);
    const generated = generateEquipmentPlan(demand, project.equipmentDefaults, project, assumptions);
    expect(generated.hybrid.inverterCount).toBe(0);
    expect(generated.hybrid.inverterWatts).toBe(0);
    expect(evaluateEquipmentPlan(demand, generated, "hybrid", project, assumptions).warnings.join(" ")).toContain("matching quote");
    generated.hybrid.inverterCount = 3;
    expect(evaluateEquipmentPlan(demand, generated, "hybrid", project, assumptions).warnings.join(" ")).toContain("parallel operation");
  });

  it("does not generate equipment or a successful status for an empty project", () => {
    const empty = { ...project, loads: [] };
    const demand = calculateProject(empty, assumptions);
    const generated = generateEquipmentPlan(demand, project.equipmentDefaults, empty, assumptions);
    expect(generated.shared.panelCount).toBe(0);
    expect(generated.shared.batteryCount).toBe(0);
    expect(generated.dc.controllerCount).toBe(0);
    expect(generated.balance.monitoringCount).toBe(0);
    expect(evaluateEquipmentPlan(demand, generated, "dc", empty, assumptions).warnings).toContain("No active loads. Enter quantity, watts and hours per day above zero to size a system.");
  });

  it("flags AC replacements only on the Fully DC option", () => {
    const demand = calculateProject(project, assumptions);
    const generated = generateEquipmentPlan(demand, project.equipmentDefaults, project, assumptions);
    expect(evaluateEquipmentPlan(demand, generated, "dc", project, assumptions).warnings.join(" ")).toContain("AC loads are listed");
    expect(evaluateEquipmentPlan(demand, generated, "hybrid", project, assumptions).warnings.join(" ")).not.toContain("AC loads are listed");
  });

  it("selects smaller practical equipment for a single router", () => {
    const small = { ...structuredClone(project), loads: [project.loads[0]], equipmentPlanMode: "generated" as const };
    const demand = calculateProject(small, assumptions);
    const generated = generateEquipmentPlan(demand, small.equipmentDefaults, small, assumptions);
    expect(generated.shared).toMatchObject({ panelCount: 1, panelWatts: 200, batteryCount: 1, batteryVoltage: 25.6, batteryAh: 50 });
    expect(generated.dc).toMatchObject({ controllerCount: 1, mpptAmps: 20 });
    expect(generated.balance.monitoringCount).toBe(0);
    expect(evaluateEquipmentPlan(demand, generated, "dc", small, assumptions).status).toBe("Preliminary checks met");
  });

  it("keeps the larger practical equipment classes for the full sample", () => {
    const demand = calculateProject(project, assumptions);
    const generated = generateEquipmentPlan(demand, project.equipmentDefaults, project, assumptions);
    expect(generated.shared.panelWatts).toBe(450);
    expect(generated.shared.batteryVoltage).toBe(25.6);
    expect(generated.shared.batteryAh).toBe(100);
    expect(generated.dc.mpptAmps).toBe(60);
    expect(generated.hybrid.inverterWatts).toBe(300);
  });
});
