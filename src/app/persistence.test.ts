import { describe, expect, it } from "vitest";
import sampleProjectData from "../data/sample-project.json";
import type { Project } from "../types/project";
import { loadAppState, normalizeProject, RECOVERY_STORAGE_KEY, saveAppState, STORAGE_KEY, STORAGE_SCHEMA_VERSION } from "./persistence";

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
