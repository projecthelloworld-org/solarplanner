import { describe, expect, it } from "vitest";
import assumptionsData from "../data/assumptions.json";
import sampleProjectData from "../data/sample-project.json";
import type { Assumptions, LoadItem, Project } from "../types/project";
import { calculateLoadRows, calculateProject } from "./calculations";

const assumptions = assumptionsData as Assumptions;

function projectWith(loads: LoadItem[]): Project {
  return { ...(structuredClone(sampleProjectData) as Project), loads };
}

const load = (overrides: Partial<LoadItem> = {}): LoadItem => ({
  id: "load-1",
  name: "Test load",
  quantity: 1,
  watts: 100,
  hoursPerDay: 4,
  currentType: "DC",
  voltage: 24,
  surgeMultiplier: 1,
  critical: false,
  ...overrides,
});

describe("solar sizing calculations", () => {
  it("normalizes load quantity and daily operating hours", () => {
    const [row] = calculateLoadRows(projectWith([load({ quantity: 2.8, hoursPerDay: 30 })]));
    expect(row.runningWatts).toBe(200);
    expect(row.dailyWh).toBe(4_800);
  });

  it("increases solar and controller sizing when sun hours decrease", () => {
    const highSun = calculateProject({ ...projectWith([load()]), sunHours: 7 }, assumptions);
    const lowSun = calculateProject({ ...projectWith([load()]), sunHours: 3.5 }, assumptions);
    expect(lowSun.dc.recommendedSolarArrayW).toBeGreaterThan(highSun.dc.recommendedSolarArrayW);
    expect(lowSun.dc.recommendedMpptCurrentA).toBeGreaterThan(highSun.dc.recommendedMpptCurrentA);
  });

  it("increases battery storage when autonomy increases without changing solar sizing", () => {
    const oneDay = calculateProject({ ...projectWith([load()]), autonomyDays: 1 }, assumptions);
    const twoDays = calculateProject({ ...projectWith([load()]), autonomyDays: 2 }, assumptions);
    expect(twoDays.dc.requiredBatteryWh).toBeGreaterThan(oneDay.dc.requiredBatteryWh);
    expect(twoDays.dc.recommendedSolarArrayW).toBe(oneDay.dc.recommendedSolarArrayW);
  });

  it("sizes the hybrid inverter from AC loads and their credible surge", () => {
    const result = calculateProject(
      projectWith([
        load({ id: "dc", currentType: "DC", watts: 1_000 }),
        load({ id: "ac", currentType: "AC", quantity: 2, watts: 100, surgeMultiplier: 2 }),
      ]),
      assumptions,
    );
    expect(result.peakLoadW).toBe(1_200);
    expect(result.acPeakLoadW).toBe(200);
    expect(result.acSurgeLoadW).toBe(400);
    expect(result.hybrid.recommendedInverterW).toBe(400);
  });

  it("does not recommend an inverter when the project has no AC loads", () => {
    const result = calculateProject(projectWith([load({ currentType: "DC" })]), assumptions);
    expect(result.hybrid.recommendedInverterW).toBe(0);
  });
});
