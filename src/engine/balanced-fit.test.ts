import { describe, expect, it } from "vitest";
import { buildProjectCsv, renderProjectReport } from "../exports/project-report";
import brands from "../data/brand-profiles.json";
import { balancedFit } from "./balanced-fit";
import { generateEquipmentCandidates, generateEquipmentPlan } from "./equipment";
import { calculateProject } from "./calculations";
import { getProjectBundle } from "./planner";
import { normalizeProject } from "../app/persistence";
import assumptions from "../data/assumptions.json";
import sample from "../data/sample-project.json";
import products from "../data/default-products.json";
import type { ProductCatalog, Project } from "../types/project";
const catalog = products as ProductCatalog;
const fixture = () => normalizeProject(structuredClone(sample) as Project);

describe("balanced equipment fit", () => {
  it("minimizes excess inside the inclusive 10% complete equipment cost window", () => {
    const cheap = { key: "cheap", equipmentCost: 100, excess: 2, units: 1 };
    const close = { key: "close", equipmentCost: 110, excess: .2, units: 3 };
    expect(balancedFit([cheap, close, { ...close, key: "outside", equipmentCost: 110.01, excess: 0 }])?.key).toBe("close");
    expect(balancedFit([{ ...cheap, key: "b" }, { ...cheap, key: "a" }])?.key).toBe("a");
    expect(balancedFit([{ ...close, equipmentCost: 109 }, close])?.equipmentCost).toBe(109);
    expect(balancedFit([cheap, { ...cheap, units: 2 }])?.units).toBe(1);
    expect(balancedFit([])).toBeUndefined();
  });
  it("accounts for the controller cost of a cheaper oversized panel", () => {
    const project = fixture(); project.systemVoltage = 12; project.loads = [{ ...project.loads[0], watts: 10, hoursPerDay: 12 }];
    const custom: ProductCatalog = { ...catalog,
      solarPanels: [{ id: "small", name: "100 W", unit: "panel", watts: 100, unitCost: 50 }, { id: "large", name: "200 W", unit: "panel", watts: 200, unitCost: 40 }],
      batteries: [{ id: "native", name: "Battery", unit: "battery", unitCost: 100, voltage: 12.8, ampHours: 100, wattHours: 1280 }],
      chargeControllers: [{ id: "small-control", name: "10 A", unit: "controller", unitCost: 20, amps: 10, supportedVoltages: [12] }], hybridInverters: [],
    };
    const result = calculateProject(project, assumptions);
    const plan = generateEquipmentPlan(result, project.equipmentDefaults, project, assumptions, custom);
    expect(plan.shared.panelProductId).toBe("small");
    expect(plan.dc.controllerCount).toBe(2); // 100 W / 12 V × 1.25 exceeds 10 A.
  });
  it("offers smaller native batteries without inventing series or parallel approval", () => {
    const project = fixture(); project.systemVoltage = 12; project.loads = [{ ...project.loads[0], watts: 5, hoursPerDay: 8 }];
    const bundle = getProjectBundle(project, assumptions);
    expect(bundle.plan.shared.batteryProductId).toBe("bat-12-20");
    expect(bundle.actuals.batteryWh).toBe(256);
    expect(bundle.priceDetails[1].basis).toBe("Representative size estimate");
    expect(bundle.evaluation.unverified?.join(" ")).toContain("Battery continuous current");
    for (const id of ["bat-12-20", "bat-12-50", "bat-48-50"]) {
      const battery = catalog.batteries.find(p => p.id === id)!;
      expect(battery.maxSeries).toBeUndefined(); expect(battery.maxParallel).toBeUndefined();
      expect(battery.continuousDischargeA).toBeUndefined();
    }
  });
  it("excludes known charge-setting conflicts and does not fabricate a compatible battery", () => {
    const project = fixture(); project.loads = [project.loads[0]];
    const custom = structuredClone(catalog);
    custom.batteries = [{ ...catalog.batteries.find(p => p.id === "bat-2560")!, chargeVoltage: 28.8 }];
    custom.chargeControllers = [{ ...catalog.chargeControllers.find(p => p.id === "mppt-20")!, chargeVoltage: 27 }];
    const result = calculateProject(project, assumptions);
    expect(generateEquipmentCandidates(result, project.equipmentDefaults, project, assumptions, custom)).toHaveLength(0);
    expect(generateEquipmentPlan(result, project.equipmentDefaults, project, assumptions, custom).shared.batteryCount).toBe(0);
  });
  it("exports the same fit and representative price classification as the dashboard bundle", () => {
    const project = fixture(); project.systemVoltage = 12; project.loads = [{ ...project.loads[0], watts: 5, hoursPerDay: 8 }];
    const bundle = getProjectBundle(project, assumptions);
    for (const output of [buildProjectCsv(project, assumptions, brands), renderProjectReport(project, assumptions, brands)]) {
      expect(output).toContain(bundle.selectionExplanation);
      expect(output).toContain("Representative size estimate");
      expect(output).toContain("Capacity Fit");
      expect(output).toContain("256");
    }
  });
  it("keeps size estimates sourced and internally consistent", () => {
    for (const p of [...catalog.solarPanels, ...catalog.batteries, ...catalog.chargeControllers].filter(p => p.priceEvidence?.[0]?.checkedOn === "2026-09-29")) {
      expect(p.priceEvidence![0].amount).toBeGreaterThan(0);
      expect(p.unitCost).toBe(Math.round(p.priceEvidence![0].amount / p.priceEvidence![0].unitsPerUsd / 5) * 5);
      expect(p.referenceKind).toBe("representative");
      if (p.voltage) expect(p.wattHours).toBe(p.voltage * p.ampHours!);
    }
  });
});
