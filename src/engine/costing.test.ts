import { describe, expect, it } from "vitest";
import assumptionsData from "../data/assumptions.json";
import sampleProjectData from "../data/sample-project.json";
import type { Assumptions, EquipmentPlan, PricingSettings, Project } from "../types/project";
import { estimateCosts } from "./costing";
import { getProjectBundle } from "./planner";

describe("cost estimates", () => {
  it("preserves cents and keeps converted line items and totals reconcilable", () => {
    const project = { ...structuredClone(sampleProjectData) as Project, currency: "KES", usdExchangeRate: 129.46 };
    project.pricing.panelUnitUsd = 0.25;
    const cost = getProjectBundle(project, assumptionsData).costs[0];
    expect(cost.lines[0].unitCost).toBe(32.37);
    expect(cost.total).toBeCloseTo(cost.lines.reduce((sum, line) => sum + line.total, 0) + cost.installation + cost.contingency, 2);
    expect(cost.totalUsd).toBeCloseTo(cost.subtotalUsd + cost.installationUsd + cost.contingencyUsd, 2);
  });

  it("never applies a foreign exchange multiplier to USD and preserves manual prices", () => {
    const project = structuredClone(sampleProjectData) as Project;
    project.usdExchangeRate = 3600;
    project.pricing.panelUnitUsd = 333.33;
    const cost = getProjectBundle(project, assumptionsData).costs[0];
    expect(cost.exchangeRate).toBe(1);
    expect(cost.total).toBe(cost.totalUsd);
    expect(cost.lines[0].unitCostUsd).toBe(333.33);
  });
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

  it("does not apply full-hub equipment and accessory allowances to one router", () => {
    const project = structuredClone(sampleProjectData) as Project;
    project.loads = [project.loads[0]];
    project.equipmentPlanMode = "generated";
    const bundle = getProjectBundle(project, assumptionsData);
    expect(bundle.pricing.batteryUnitUsd).toBe(180);
    expect(bundle.pricing.controllerUnitUsd).toBe(50);
    expect(bundle.pricing.dcDistributionUnitUsd).toBe(40);
    expect(bundle.costs[0].totalUsd).toBe(580.58);
  });
});
