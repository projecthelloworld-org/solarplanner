import { describe, expect, it } from "vitest";
import type { CalculationResult, EquipmentPlan } from "../types/project";
import { evaluateEquipmentPlan, getEquipmentActuals } from "./equipment";

const plan: EquipmentPlan = {
  shared: { panelCount: 2, panelWatts: 450, batteryCount: 2, batteryVoltage: 24, batteryAh: 100 },
  dc: { controllerCount: 2, mpptAmps: 30 },
  hybrid: { controllerCount: 3, mpptAmps: 20, inverterCount: 1, inverterWatts: 500 },
  balance: { dcDistributionCount: 1, acDistributionCount: 1, cablingCount: 1, earthingCount: 1, monitoringCount: 1 },
};

const result = {
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
    expect(evaluateEquipmentPlan(result, plan, "dc").status).toBe("Preliminary checks met");
    const undersized = structuredClone(plan);
    undersized.shared.panelCount = 1;
    expect(evaluateEquipmentPlan(result, undersized, "dc").status).toBe("Needs attention");
  });
});
