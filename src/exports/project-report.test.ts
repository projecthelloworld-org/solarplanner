import { describe, expect, it } from "vitest";
import assumptionsData from "../data/assumptions.json";
import brandProfilesData from "../data/brand-profiles.json";
import sampleProjectData from "../data/sample-project.json";
import type { Assumptions, BrandProfile, Project } from "../types/project";
import { buildProjectCsv, projectCsvFilename, renderProjectReport } from "./project-report";
import { getProjectBundle } from "../engine/planner";

describe("project report exports", () => {
  it("exports the selected system sections and current load data", () => {
    const project = { ...(structuredClone(sampleProjectData) as Project), selectedSystem: "dc" as const };
    project.loads[0].name = "=unsafe spreadsheet value";
    const csv = buildProjectCsv(project, assumptionsData as Assumptions, brandProfilesData as BrandProfile[]);
    expect(csv).toContain('"Project Summary"');
    expect(csv).toContain('"Fully DC System"');
    expect(csv).not.toContain('"Hybrid DC + AC System option"');
    expect(csv).toContain('"\'=unsafe spreadsheet value"');
  });

  it("creates a filesystem-safe filename", () => {
    const project = { ...(structuredClone(sampleProjectData) as Project), name: "Hello Hub: Kampala / 01" };
    expect(projectCsvFilename(project)).toBe("hello-hub-kampala-01-report.csv");
  });

  it("carries installed-array requirements, edited prices and warnings into both exports", () => {
    const project = structuredClone(sampleProjectData) as Project;
    project.selectedSystem = "hybrid";
    project.equipmentPlanMode = "custom";
    project.equipmentPlan = getProjectBundle(project, assumptionsData).generatedPlan;
    project.equipmentPlan.shared.panelCount = 20;
    project.pricing.panelUnitUsd = 123.45;
    project.name = '<img src=x onerror="alert(1)">';
    const csv = buildProjectCsv(project, assumptionsData, brandProfilesData);
    const html = renderProjectReport(project, assumptionsData, brandProfilesData);
    for (const exportText of [csv, html]) {
      expect(exportText).toContain("470 A");
      expect(exportText).toContain("123.45");
      expect(exportText).toContain("Needs attention");
      expect(exportText).toContain("idle consumption");
    }
    expect(html).not.toContain('<img src=x');
    expect(html).toContain("&lt;img");
    expect(csv).toContain('"Project name"');
  });

  it("exports the load-sensitive catalogue prices for an untouched generated plan", () => {
    const project = structuredClone(sampleProjectData) as Project;
    project.loads = [project.loads[0]];
    const csv = buildProjectCsv(project, assumptionsData, brandProfilesData);
    const html = renderProjectReport(project, assumptionsData, brandProfilesData);
    for (const exportText of [csv, html]) {
      expect(exportText).toContain("25.6 V x 50 Ah");
      expect(exportText).toContain("USD 180");
      expect(exportText).toContain("USD 580.58");
    }
  });
});
