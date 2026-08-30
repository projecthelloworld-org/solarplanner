import { describe, expect, it } from "vitest";
import assumptionsData from "../data/assumptions.json";
import brandProfilesData from "../data/brand-profiles.json";
import sampleProjectData from "../data/sample-project.json";
import type { Assumptions, BrandProfile, Project } from "../types/project";
import { buildProjectCsv, projectCsvFilename } from "./project-report";

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
});
