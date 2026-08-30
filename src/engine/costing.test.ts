import { describe, expect, it } from "vitest";
import assumptionsData from "../data/assumptions.json";
import sampleProjectData from "../data/sample-project.json";
import type { Assumptions, EquipmentPlan, PricingSettings, Project } from "../types/project";
import { estimateCosts } from "./costing";

describe("cost estimates", () => {
  it("applies quantities, installation, contingency, and exchange rate", () => {
    const project = { ...(structuredClone(sampleProjectData) as Project), currency: "UGX", usdExchangeRate: 3_600 };
    const assumptions = { ...(assumptionsData as Assumptions), installationRate: 0.1, contingencyRate: 0.1 };
    const plan: EquipmentPlan = {
      shared: { panelCount: 2, panelWatts: 450, batteryCount: 0, batteryVoltage: 24, batteryAh: 100 },
      dc: { controllerCount: 0, mpptAmps: 30 },
      hybrid: { controllerCount: 0, mpptAmps: 30, inverterCount: 0, inverterWatts: 500 },
      balance: { dcDistributionCount: 0, acDistributionCount: 0, cablingCount: 0, earthingCount: 0, monitoringCount: 0 },
    };
    const pricing: PricingSettings = {
      panelUnitUsd: 100,
      batteryUnitUsd: 0,
      controllerUnitUsd: 0,
      inverterUnitUsd: 0,
      dcDistributionUnitUsd: 0,
      acDistributionUnitUsd: 0,
      cablingUnitUsd: 0,
      earthingUnitUsd: 0,
      monitoringUnitUsd: 0,
    };

    const estimate = estimateCosts(project, plan, pricing, assumptions, "dc");
    expect(estimate.subtotalUsd).toBe(200);
    expect(estimate.installationUsd).toBe(20);
    expect(estimate.contingencyUsd).toBe(22);
    expect(estimate.totalUsd).toBe(242);
    expect(estimate.total).toBe(871_200);
  });
});
