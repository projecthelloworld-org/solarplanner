import { describe, expect, it } from "vitest";
import sampleProjectData from "../data/sample-project.json";
import type { Project } from "../types/project";
import { loadAppState, normalizeProject, RECOVERY_STORAGE_KEY, saveAppState, STORAGE_KEY, STORAGE_SCHEMA_VERSION } from "./persistence";
import catalog from "../data/default-products.json";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("project persistence", () => {
  it("uses the reviewed catalogue prices and matching starter capacities", () => {
    const sample = normalizeProject(sampleProjectData as Project);
    const fallback = normalizeProject({ pricing: undefined, equipmentDefaults: undefined });
    expect(fallback.pricing).toEqual(sample.pricing);
    expect(sample.pricing.panelUnitUsd).toBe(catalog.solarPanels.find((item) => item.id === "pv-450")!.unitCost);
    expect(sample.pricing.batteryUnitUsd).toBe(catalog.batteries.find((item) => item.id === "bat-2560")!.unitCost);
    expect(sample.equipmentDefaults.batteryVoltage * sample.equipmentDefaults.batteryAh).toBe(catalog.batteries.find((item) => item.id === "bat-2560")!.wattHours);
    expect(sample.equipmentDefaults.mpptAmpStep).toBe(catalog.chargeControllers.find((item) => item.id === "mppt-60")!.amps);
    expect(sample.equipmentDefaults.inverterWattStep).toBe(catalog.hybridInverters.find((item) => item.id === "hybrid-1000")!.watts);
    expect(sample.pricing.inverterUnitUsd).toBe(catalog.hybridInverters.find((item) => item.id === "hybrid-1000")!.unitCost);
  });

  it("retains previously saved prices and equipment defaults during upgrades", () => {
    const legacy = structuredClone(sampleProjectData) as Project;
    legacy.pricing.panelUnitUsd = 80;
    legacy.equipmentDefaults.batteryVoltage = 24;
    const normalized = normalizeProject(legacy);
    expect(normalized.pricing.panelUnitUsd).toBe(80);
    expect(normalized.equipmentDefaults.batteryVoltage).toBe(24);
  });

  it("remains usable when storage is unavailable", () => {
    const { state, notice } = loadAppState(undefined);
    expect(state.projects.length).toBe(1);
    expect(notice).toContain("could not be read");
    expect(saveAppState(state, undefined)).toContain("could not save");
  });

  it("normalizes unsafe currency labels and duplicate load identifiers", () => {
    const raw = structuredClone(sampleProjectData) as Project;
    raw.currency = '<img src=x onerror="alert(1)">';
    raw.usdExchangeRate = 3600;
    raw.loads[1].id = raw.loads[0].id;
    const normalized = normalizeProject(raw);
    expect(normalized.currency).toBe("USD");
    expect(normalized.usdExchangeRate).toBe(1);
    expect(new Set(normalized.loads.map((load) => load.id)).size).toBe(normalized.loads.length);
  });
  it("preserves unreadable state and returns a usable fallback", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, "{not valid json");
    const loaded = loadAppState(storage);
    expect(loaded.state.projects).toHaveLength(1);
    expect(loaded.notice).toContain("recovery copy");
    expect(storage.getItem(RECOVERY_STORAGE_KEY)).toBe("{not valid json");
  });

  it("keeps zero pricing while normalizing unsafe project values", () => {
    const raw = structuredClone(sampleProjectData) as Project;
    raw.pricing.panelUnitUsd = 0;
    raw.sunHours = 0;
    raw.loads[0].hoursPerDay = 30;
    const normalized = normalizeProject(raw);
    expect(normalized.pricing.panelUnitUsd).toBe(0);
    expect(normalized.sunHours).toBe(sampleProjectData.sunHours);
    expect(normalized.loads[0].hoursPerDay).toBe(0);
  });

  it("writes the current schema version", () => {
    const storage = new MemoryStorage();
    const state = loadAppState(storage).state;
    expect(saveAppState(state, storage)).toBe("");
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}").schemaVersion).toBe(STORAGE_SCHEMA_VERSION);
  });
});

describe("schema v2 accuracy migration", () => {
  it("backs up v1 and switches only default efficiency to manufacturer mode", () => {
    const storage = new MemoryStorage();
    const original = JSON.stringify({ schemaVersion: 1, activeProjectId: sampleProjectData.id, projects: [sampleProjectData], assumptions: { inverterEfficiency: .88 } });
    storage.setItem(STORAGE_KEY, original);
    const loaded = loadAppState(storage);
    expect(storage.getItem(`${STORAGE_KEY}-migration-v1`)).toBe(original);
    expect(loaded.state.projects[0].inverterSettings?.mode).toBe("manufacturer");
    expect(loaded.notice).toContain("Generated recommendations may change");
    expect(saveAppState(loaded.state, storage)).toBe("");
    const second = loadAppState(storage);
    expect(second.notice).toBe("");
    expect(second.state.projects).toEqual(loaded.state.projects);
    expect(storage.getItem(`${STORAGE_KEY}-migration-v1`)).toBe(original);
  });
  it("preserves non-default efficiency, old custom plans and quotations in both options", async () => {
    const { getProjectBundle } = await import("../engine/planner");
    const { default: assumptions } = await import("../data/assumptions.json");
    const project = structuredClone(sampleProjectData) as Project;
    project.equipmentPlanMode = "custom";
    project.equipmentPlan = getProjectBundle({ ...project, equipmentPlanMode: "generated" }, assumptions).plan;
    project.pricing.panelUnitUsd = 123.45;
    project.pricing.hybridControllerUnitUsd = 125;
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, projects: [project], assumptions: { inverterEfficiency: .91 } }));
    const restored = loadAppState(storage).state.projects[0];
    expect(restored.inverterSettings).toMatchObject({ mode: "manual", efficiency: .91 });
    for (const id of ["dc", "hybrid"] as const) {
      expect(restored.optionPlans?.[id]?.mode).toBe("custom");
      expect(restored.optionPlans?.[id]?.equipment).toEqual(project.equipmentPlan);
      expect(restored.optionPlans?.[id]?.pricingOverrides).toMatchObject({ panelUnitUsd: 123.45, hybridControllerUnitUsd: 125 });
    }
    restored.optionPlans!.dc!.equipment!.shared.panelCount = 77;
    expect(restored.optionPlans!.hybrid!.equipment!.shared.panelCount).not.toBe(77);
  });
  it("does not overwrite the original when the migration backup cannot be stored", () => {
    class BackupDenied extends MemoryStorage {
      override setItem(key: string, value: string) { if (key.endsWith("migration-v1")) throw new Error("quota"); super.setItem(key, value); }
    }
    const storage = new BackupDenied();
    const original = JSON.stringify({ schemaVersion: 1, projects: [sampleProjectData] });
    storage.setItem(STORAGE_KEY, original);
    const loaded = loadAppState(storage);
    expect(loaded.state.pendingMigrationBackup).toBe(original);
    expect(saveAppState(loaded.state, storage)).toContain("could not save");
    expect(storage.getItem(STORAGE_KEY)).toBe(original);
  });
  it("round-trips optional inputs without replacing missing values with zero", () => {
    const project = normalizeProject(sampleProjectData as Project);
    project.loads[0].powerFactor = .8;
    project.loads[0].startupSeconds = 3;
    project.loads[0].startupGroup = "network";
    project.inverterSettings = { mode: "manufacturer", unloadedHoursPerDay: 0 };
    project.optionPlans!.hybrid!.engineering = { panel: { voc: 45 }, minimumCellTemperatureC: 0, pvAssignments: [{ target: "separate", controllerIndex: 1, input: 1, series: 2, parallel: 1 }] };
    const restored = normalizeProject(JSON.parse(JSON.stringify(project)));
    expect(restored.loads[0]).toMatchObject({ powerFactor: .8, startupSeconds: 3, startupGroup: "network" });
    expect(restored.loads[0].startupVA).toBeUndefined();
    expect(restored.inverterSettings?.unloadedHoursPerDay).toBe(0);
    expect(restored.optionPlans!.hybrid!.engineering?.minimumCellTemperatureC).toBe(0);
    expect(restored.optionPlans!.hybrid!.engineering?.panel?.voc).toBe(45);
    expect(restored.optionPlans!.hybrid!.engineering?.panel?.isc).toBeUndefined();
  });
});
