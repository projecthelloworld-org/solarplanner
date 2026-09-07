import { describe, expect, it } from "vitest";
import sampleProjectData from "../data/sample-project.json";
import type { Project } from "../types/project";
import { validateProject } from "./validation";

describe("planning input validation", () => {
  it("rejects impossible operating hours and fractional quantities", () => {
    const project = structuredClone(sampleProjectData) as Project;
    project.loads[0].hoursPerDay = 25;
    project.loads[0].quantity = 1.5;
    const messages = validateProject(project).map((issue) => issue.message);
    expect(messages.some((message) => message.includes("hours per day"))).toBe(true);
    expect(messages.some((message) => message.includes("whole number"))).toBe(true);
  });
});
