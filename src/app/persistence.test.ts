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
