import { describe, expect, it } from "vitest";
import sample from "../data/sample-project.json";
import assumptions from "../data/assumptions.json";
import brands from "../data/brand-profiles.json";
import type { Project } from "../types/project";
import { getProjectBundle, regenerateEquipment } from "./planner";
import { priceIdentity } from "./pricing";
import { normalizeProject } from "../app/persistence";
import { buildProjectCsv, renderProjectReport } from "../exports/project-report";
const fixture = () => normalizeProject({ ...structuredClone(sample) as Project, loads: structuredClone(sample.loads.slice(0, 2)) as Project["loads"] });

describe("equipment prices and regeneration", () => {
  it("reconciles both screenshot options and quantity edits", () => {
    const project = fixture(); const base = getProjectBundle(project, assumptions);
    expect(base.costs.map(c => c.totalUsd)).toEqual([2188.34, 2188.34]);
    const plan = structuredClone(base.options.dc.plan); plan.shared.panelCount = 2;
    project.optionPlans!.dc = { mode: "custom", equipment: plan, pricingOverrides: {} };
    const changed = getProjectBundle(project, assumptions);
    expect(changed.options.dc.pricing.panelUnitUsd).toBe(110);
    expect(changed.options.dc.priceDetails[0].totalUsd).toBe(220);
    expect(changed.options.dc.cost.totalUsd).toBe(2328.7);
    expect(changed.options.hybrid.cost.totalUsd).toBe(2188.34);
  });
  it("regenerates both edited plans while retaining quotations", () => {
    const project = fixture(); const base = getProjectBundle(project, assumptions);
    for (const system of ["dc", "hybrid"] as const) {
      const plan = structuredClone(base.options[system].plan); plan.shared.panelCount = 8;
      project.optionPlans![system] = { mode: "custom", equipment: plan, pricingOverrides: { panelUnitUsd: 123 }, quoteEquipment: { panelUnitUsd: priceIdentity(plan, "panelUnitUsd") } };
    }
    const next = regenerateEquipment(project, assumptions); const bundle = getProjectBundle(next, assumptions);
    for (const system of ["dc", "hybrid"] as const) {
      expect(next.optionPlans![system]!.mode).toBe("generated");
      expect(bundle.options[system].plan.shared.panelCount).toBe(1);
      expect(bundle.options[system].pricing.panelUnitUsd).toBe(123);
      expect(bundle.options[system].priceDetails[0].review).toBe(false);
    }
  });
  it("flags changed and unknown quote identities and preserves them on reload", () => {
    const project = fixture(); const base = getProjectBundle(project, assumptions);
    project.optionPlans!.dc!.pricingOverrides = { panelUnitUsd: 0, batteryUnitUsd: 321 };
    project.optionPlans!.dc!.quoteEquipment = { panelUnitUsd: "panel:old:100" };
    const restored = normalizeProject(JSON.parse(JSON.stringify(project)));
    const details = getProjectBundle(restored, assumptions).priceDetails;
    expect(details[0]).toMatchObject({ basis: "User quotation", unitUsd: 0, review: true });
    expect(details[1]).toMatchObject({ basis: "User quotation", unitUsd: 321, review: true });
    delete restored.optionPlans!.dc!.pricingOverrides.panelUnitUsd;
    expect(getProjectBundle(restored, assumptions).pricing.panelUnitUsd).toBe(base.pricing.panelUnitUsd);
  });
  it("labels unmatched equipment prices as unverified rather than scaling prices", () => {
    const project = fixture(); const plan = structuredClone(getProjectBundle(project, assumptions).plan);
    plan.shared.panelWatts = 999; plan.shared.panelProductId = undefined;
    project.optionPlans!.dc = { mode: "custom", equipment: plan, pricingOverrides: {} };
    expect(getProjectBundle(project, assumptions).priceDetails[0]).toMatchObject({ basis: "Unverified allowance", unitUsd: 110 });
  });
  it("clears ratings of replaced products, preserves general inputs and rechecks allocations", () => {
    const project = fixture(); const plan = structuredClone(getProjectBundle(project, assumptions).plan);
    plan.shared.panelProductId = "pv-100"; plan.shared.panelWatts = 100;
    project.optionPlans!.dc = { mode: "custom", equipment: plan, pricingOverrides: {}, engineering: { panel: { voc: 22 }, minimumCellTemperatureC: 0, pvAssignments: [{ target: "separate", controllerIndex: 1, input: 1, series: 2, parallel: 1 }] } };
    const next = regenerateEquipment(project, assumptions);
    expect(next.optionPlans!.dc!.engineering?.panel).toBeUndefined();
    expect(next.optionPlans!.dc!.engineering?.minimumCellTemperatureC).toBe(0);
    expect(getProjectBundle(next, assumptions).evaluation.checks.find(c => c.label === "PV array allocation")?.status).toBe("failed");
  });
  it("shares price provenance and values across PDF and CSV", () => {
    const project = fixture(); project.optionPlans!.dc!.pricingOverrides = { batteryUnitUsd: 321 };
    for (const output of [buildProjectCsv(project, assumptions, brands), renderProjectReport(project, assumptions, brands)]) {
      expect(output).toContain("Price Basis"); expect(output).toContain("User quotation");
      expect(output).toContain("Confirm retained quotation"); expect(output).toContain("642");
    }
  });
});
