import { describe, expect, it } from "vitest";
import sample from "../data/sample-project.json";
import assumptions from "../data/assumptions.json";
import products from "../data/default-products.json";
import brands from "../data/brand-profiles.json";
import type { ProductCatalog, Project } from "../types/project";
import { calculateProject } from "./calculations";
import { evaluateEquipmentPlan, generateEquipmentPlan, includedMpptAmps, matchedInverter } from "./equipment";
import { getProjectBundle } from "./planner";
import { normalizeProject } from "../app/persistence";
import { buildProjectCsv, renderProjectReport } from "../exports/project-report";

const site = (voltage = 24): Project => ({ ...structuredClone(sample) as Project, systemVoltage: voltage, equipmentPlanMode: "generated" });
const catalog = products as ProductCatalog;

describe("voltage-compatible planning", () => {
  for (const voltage of [12, 24, 48]) {
    for (const count of [1, 2, sample.loads.length]) {
      it(`checks ${count} device groups at ${voltage} V without cross-voltage substitutions`, () => {
        const project = site(voltage);
        project.loads = project.loads.slice(0, count);
        const bundle = getProjectBundle(project, assumptions);
        const battery = catalog.batteries.find((item) => item.id === bundle.plan.shared.batteryProductId);
        if (battery) {
          expect(battery.systemVoltage).toBe(voltage);
          expect(bundle.actuals.batteryWh).toBeCloseTo(bundle.plan.shared.batteryCount * battery.voltage! * battery.ampHours!);
          expect(bundle.actuals.batteryWh).toBeGreaterThanOrEqual(bundle.result.hybrid.requiredBatteryWh);
        } else {
          expect(bundle.evaluations.dc.status).toBe("Needs attention");
          expect(bundle.evaluations.dc.warnings.join(" ")).toContain("no compatible battery");
        }
        expect(catalog.chargeControllers.find((item) => item.id === bundle.plan.dc.controllerProductId)?.supportedVoltages).toContain(voltage);
        if (bundle.plan.hybrid.inverterCount) expect(matchedInverter(bundle.plan)?.systemVoltage).toBe(voltage);
      });
    }
  }

  it("only generates a series string with documented approval and complete quantity", () => {
    const project = site(24);
    project.loads = [project.loads[0]];
    const customCatalog = structuredClone(catalog);
    customCatalog.batteries = [{ ...catalog.batteries[1], maxParallel: 4, continuousDischargeA: 100 }];
    const result = calculateProject(project, assumptions);
    expect(generateEquipmentPlan(result, project.equipmentDefaults, project, assumptions, customCatalog).shared.batteryCount).toBe(0);
    customCatalog.batteries[0].maxSeries = 2;
    const plan = generateEquipmentPlan(result, project.equipmentDefaults, project, assumptions, customCatalog);
    expect(plan.shared.batteryCount).toBe(2);
    expect(plan.shared.batteryVoltage).toBe(12.8);
  });

  it("selects an integrated inverter when cheaper and does not duplicate its controller price", () => {
    const project = site(24);
    project.selectedSystem = "hybrid";
    project.loads = [{ ...project.loads[0], currentType: "AC", watts: 600, hoursPerDay: 2 }];
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.plan.hybrid.inverterProductId).toBe("hybrid-2000");
    expect(includedMpptAmps(bundle.plan)).toBe(60);
    expect(bundle.plan.hybrid.controllerCount).toBe(0);
    expect(bundle.plan.dc.controllerCount).toBeGreaterThan(0);
    expect(bundle.costs[1].lines.find((line) => line.category === "Charge controller or hybrid inverter")?.totalUsd).toBe(0);
    expect(bundle.costs[1].lines.find((line) => line.category === "Hybrid inverter capacity")?.totalUsd).toBe(310);
    for (const exported of [buildProjectCsv(project, assumptions, brands), renderProjectReport(project, assumptions, brands)]) {
      expect(exported).toContain("24 V input");
      expect(exported).toContain("60 A MPPT included");
      expect(exported).toContain("310");
    }
  });

  it("adds external controller capacity for array power above the integrated PV limit", () => {
    const project = site(24);
    project.loads = [{ ...project.loads[0], currentType: "AC", watts: 600, hoursPerDay: 12 }];
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.actuals.solarArrayW).toBeGreaterThan(1500);
    expect(bundle.plan.hybrid.controllerCount).toBeGreaterThan(0);
    expect(bundle.actuals.hybridMpptA).toBeGreaterThanOrEqual(bundle.actuals.solarArrayW / 24 * assumptions.mpptSafetyFactor);
  });

  it("preserves edited equipment and prices across voltage changes and serialization", () => {
    const project = site(24);
    project.equipmentPlan = getProjectBundle(project, assumptions).plan;
    project.equipmentPlanMode = "custom";
    project.pricing.inverterUnitUsd = 123.45;
    project.systemVoltage = 48;
    const restored = normalizeProject(JSON.parse(JSON.stringify(project)));
    const bundle = getProjectBundle(restored, assumptions);
    expect(bundle.plan.hybrid.inverterProductId).toBe(project.equipmentPlan.hybrid.inverterProductId);
    expect(bundle.pricing.inverterUnitUsd).toBe(123.45);
    expect(bundle.evaluations.hybrid.status).toBe("Needs attention");
    expect(bundle.evaluations.hybrid.warnings.join(" ")).toContain("compatible single inverter");
    restored.equipmentPlanMode = "generated";
    expect(matchedInverter(getProjectBundle(restored, assumptions).plan)?.systemVoltage).toBe(48);
    expect(getProjectBundle(restored, assumptions).pricing.inverterUnitUsd).toBe(123.45);
  });

  it("does not trust edited capacities just because they retain a catalogue ID", () => {
    const project = site();
    const bundle = getProjectBundle(project, assumptions);
    bundle.plan.hybrid.inverterWatts = 9999;
    expect(includedMpptAmps(bundle.plan)).toBe(0);
    bundle.plan.shared.batteryAh = 9999;
    expect(evaluateEquipmentPlan(bundle.result, bundle.plan, "hybrid", project, assumptions).warnings.join(" ")).toContain("Battery specification is unverified");
  });

  it("keeps option-specific controller quotations independent", () => {
    const project = site();
    project.equipmentPlan = getProjectBundle(project, assumptions).plan;
    project.equipmentPlanMode = "custom";
    project.pricing.controllerUnitUsd = 80;
    project.pricing.hybridControllerUnitUsd = 125;
    const bundle = getProjectBundle(normalizeProject(JSON.parse(JSON.stringify(project))), assumptions);
    expect(bundle.costs[0].lines.find((line) => line.category === "Charge controller or hybrid inverter")?.unitCostUsd).toBe(80);
    expect(bundle.costs[1].lines.find((line) => line.category === "Charge controller or hybrid inverter")?.unitCostUsd).toBe(125);
  });

  it("retains unsupported legacy voltage with explicit warnings", () => {
    const project = normalizeProject({ ...site(), systemVoltage: 36 });
    const bundle = getProjectBundle(project, assumptions);
    expect(project.systemVoltage).toBe(36);
    expect(bundle.evaluations.hybrid.status).toBe("Needs attention");
    expect(bundle.evaluations.hybrid.warnings.join(" ")).toContain("no supported catalogue configuration");
  });

  it("compares integrated and standalone combinations by complete cost", () => {
    const project = site();
    project.loads = [{ ...project.loads[0], currentType: "AC", hoursPerDay: 4 }];
    const custom = structuredClone(catalog);
    custom.hybridInverters = [
      { id: "standalone", name: "Standalone fixture", unit: "inverter", unitCost: 40, watts: 300, systemVoltage: 24, inverterType: "standalone" },
      { id: "integrated", name: "Integrated fixture", unit: "inverter", unitCost: 70, watts: 300, systemVoltage: 24, inverterType: "integrated", integratedMpptA: 20, maxPvWatts: 520 },
    ];
    const generated = generateEquipmentPlan(calculateProject(project, assumptions), project.equipmentDefaults, project, assumptions, custom);
    expect(generated.hybrid.inverterProductId).toBe("integrated");
    expect(generated.hybrid.controllerCount).toBe(0);
  });

  it("flags BMS overload even when battery Wh is sufficient", () => {
    const project = site();
    project.loads = [{ ...project.loads[0], watts: 1500, hoursPerDay: 0.01 }];
    const result = calculateProject(project, assumptions);
    const plan = generateEquipmentPlan(result, project.equipmentDefaults, project, assumptions);
    plan.shared = { ...plan.shared, batteryProductId: "bat-24-50", batteryCount: 1, batteryVoltage: 25.6, batteryAh: 50 };
    expect(evaluateEquipmentPlan(result, plan, "dc", project, assumptions).warnings.join(" ")).toContain("BMS continuous discharge current");
  });

  it("keeps energy independent of voltage and responds to sunlight and load hours", () => {
    const project = site();
    const original = getProjectBundle(project, assumptions);
    const lowSun = getProjectBundle({ ...project, sunHours: project.sunHours / 2 }, assumptions);
    expect(lowSun.result.dc.recommendedSolarArrayW).toBeGreaterThan(original.result.dc.recommendedSolarArrayW * 1.9);
    expect(lowSun.result.dc.requiredBatteryWh).toBe(original.result.dc.requiredBatteryWh);
    expect(getProjectBundle({ ...project, systemVoltage: 48 }, assumptions).result.totalDailyWh).toBe(original.result.totalDailyWh);
    project.loads = project.loads.map((load) => ({ ...load, hoursPerDay: load.hoursPerDay / 2 }));
    expect(getProjectBundle(project, assumptions).result.totalDailyWh).toBe(original.result.totalDailyWh / 2);
  });
});
