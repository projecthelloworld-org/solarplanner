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
    const highSun = calculateProject({ ...projectWith([load({ watts: 1000 })]), sunHours: 7 }, assumptions);
    const lowSun = calculateProject({ ...projectWith([load({ watts: 1000 })]), sunHours: 3.5 }, assumptions);
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

  it("matches a hand-calculated mixed-load energy balance and applies DoD once", () => {
    const site = { ...projectWith([load({ watts: 40, hoursPerDay: 24 }), load({ currentType: "AC", watts: 100, hoursPerDay: 2 })]), sunHours: 4, autonomyDays: 2 };
    const settings = { ...assumptions, dcDistributionEfficiency: 1, hybridDcEfficiency: 1, inverterEfficiency: 0.8, batteryDepthOfDischarge: 0.8, batteryReserveFactor: 1.2, arrayDerateFactor: 0.75 };
    const result = calculateProject(site, settings);
    expect(result.totalDailyWh).toBe(1160);
    expect(result.dc.adjustedDailyWh).toBe(1160);
    expect(result.hybrid.adjustedDailyWh).toBe(1210);
    expect(result.hybrid.requiredBatteryWh).toBe(3700); // 1210 * 2 * 1.2 / .8 = 3630, rounded up.
    expect(result.hybrid.recommendedSolarArrayW).toBe(490); // 1210 / 4 / .75 * 1.2 = 484.
    expect(result.hybrid.recommendedMpptCurrentA).toBe(30); // 490 / 24 * 1.25.
  });

  it("excludes inactive rows from both energy and peak/surge demand", () => {
    const result = calculateProject(projectWith([load({ hoursPerDay: 0, currentType: "AC", watts: 5000 }), load({ quantity: 0 })]), assumptions);
    expect(result.totalDailyWh).toBe(0);
    expect(result.peakLoadW).toBe(0);
    expect(result.surgeLoadW).toBe(0);
    expect(result.hybrid.recommendedInverterW).toBe(0);
  });

  it("keeps fractional watt-hour demand in sizing and treats critical as a label", () => {
    const site = projectWith([load({ watts: 0.25, hoursPerDay: 0.5, critical: true })]);
    const result = calculateProject(site, assumptions);
    expect(result.dc.recommendedSolarArrayW).toBe(10);
    expect(result.dc.requiredBatteryWh).toBe(100);
    expect(result.loadRows[0].dailyWh).toBe(0.125);
    expect(calculateProject(projectWith([{ ...site.loads[0], critical: false }]), assumptions).dc).toEqual(result.dc);
  });
});
