import assumptionsData from "../data/assumptions.json";
import productsData from "../data/default-products.json";
import sampleProjectData from "../data/sample-project.json";
import { validateAssumptions } from "../engine/validation";
import type { Assumptions, EquipmentDefaults, PricingSettings, ProductCatalog, Project } from "../types/project";
import { clone, uid } from "../utils/html";

export interface AppState {
  schemaVersion: number;
  activeProjectId: string;
  projects: Project[];
  assumptions: Assumptions;
  products: ProductCatalog;
}

export interface LoadStateResult {
  state: AppState;
  notice: string;
}

export const STORAGE_KEY = "hello-solar-planner-state";
export const RECOVERY_STORAGE_KEY = `${STORAGE_KEY}-recovery`;
export const STORAGE_SCHEMA_VERSION = 1;

const defaultProducts = productsData as ProductCatalog;
const defaultAssumptions = assumptionsData as Assumptions;
const productCost = (group: keyof ProductCatalog, id: string): number => defaultProducts[group].find((item) => item.id === id)?.unitCost ?? 0;

const defaultEquipmentDefaults: EquipmentDefaults = {
  panelWatts: 450,
  batteryVoltage: 25.6,
  batteryAh: 100,
  mpptAmpStep: 60,
  inverterWattStep: 1000,
};

const defaultPricing: PricingSettings = {
  panelUnitUsd: productCost("solarPanels", "pv-450"),
  batteryUnitUsd: productCost("batteries", "bat-2560"),
  controllerUnitUsd: productCost("chargeControllers", "mppt-60"),
  inverterUnitUsd: productCost("hybridInverters", "hybrid-1000"),
  dcDistributionUnitUsd: productCost("dcDistribution", "dc-board"),
  acDistributionUnitUsd: productCost("acDistribution", "ac-board"),
  cablingUnitUsd: productCost("cabling", "cable-kit"),
  earthingUnitUsd: productCost("earthing", "earth-kit"),
  monitoringUnitUsd: productCost("monitoring", "monitor-kit"),
};

const toCents = (value: number): number => Math.round(value * 100) / 100;

const boundedNumber = (value: unknown, fallback: number, minimum: number, maximum = 1_000_000, integer = false): number => {
  if (value === null || value === "" || typeof value === "boolean") return fallback;
  const candidate = Number(value);
  if (!Number.isFinite(candidate) || candidate < minimum || candidate > maximum) return fallback;
  return integer ? Math.floor(candidate) : candidate;
};

function normalizePricing(input: unknown = {}): PricingSettings {
  const rawPricing = input && typeof input === "object" ? (input as Partial<PricingSettings> & Record<string, unknown>) : {};
  const price = (value: unknown, fallback: number) => toCents(boundedNumber(value, fallback, 0));
  const legacyPrice = (unitValue: unknown, rateValue: unknown, capacity: number, fallback: number) =>
    unitValue !== undefined ? price(unitValue, fallback) : price(Number(rateValue) * capacity, fallback);

  return {
    panelUnitUsd: legacyPrice(rawPricing.panelUnitUsd, rawPricing.panelUsdPerW, defaultEquipmentDefaults.panelWatts, defaultPricing.panelUnitUsd),
    batteryUnitUsd: legacyPrice(
      rawPricing.batteryUnitUsd,
      rawPricing.batteryUsdPerWh,
      defaultEquipmentDefaults.batteryVoltage * defaultEquipmentDefaults.batteryAh,
      defaultPricing.batteryUnitUsd,
    ),
    controllerUnitUsd: price(rawPricing.controllerUnitUsd ?? rawPricing.chargeControllerUsd, defaultPricing.controllerUnitUsd),
    hybridControllerUnitUsd: rawPricing.hybridControllerUnitUsd === undefined ? undefined : price(rawPricing.hybridControllerUnitUsd, defaultPricing.controllerUnitUsd),
    inverterUnitUsd: legacyPrice(rawPricing.inverterUnitUsd, rawPricing.inverterUsdPerW, defaultEquipmentDefaults.inverterWattStep, defaultPricing.inverterUnitUsd),
    dcDistributionUnitUsd: price(rawPricing.dcDistributionUnitUsd ?? rawPricing.dcDistributionUsd, defaultPricing.dcDistributionUnitUsd),
    acDistributionUnitUsd: price(rawPricing.acDistributionUnitUsd ?? rawPricing.acDistributionUsd, defaultPricing.acDistributionUnitUsd),
    cablingUnitUsd: price(rawPricing.cablingUnitUsd ?? rawPricing.cablingUsd, defaultPricing.cablingUnitUsd),
    earthingUnitUsd: price(rawPricing.earthingUnitUsd ?? rawPricing.earthingUsd, defaultPricing.earthingUnitUsd),
    monitoringUnitUsd: price(rawPricing.monitoringUnitUsd ?? rawPricing.monitoringUsd, defaultPricing.monitoringUnitUsd),
  };
}

export function normalizeAssumptions(rawAssumptions: Partial<Assumptions> = {}): Assumptions {
  const normalized = { ...defaultAssumptions, ...rawAssumptions };
  validateAssumptions(normalized).forEach((issue) => {
    const field = issue.path as keyof Assumptions;
    (normalized[field] as string | number) = defaultAssumptions[field];
  });
  return normalized;
}

function normalizeEquipmentPlan(plan: Project["equipmentPlan"]): Project["equipmentPlan"] {
  if (!plan) return undefined;

  return {
    shared: {
      panelProductId: typeof plan.shared?.panelProductId === "string" ? plan.shared.panelProductId : undefined,
      batteryProductId: typeof plan.shared?.batteryProductId === "string" ? plan.shared.batteryProductId : undefined,
      panelCount: boundedNumber(plan.shared?.panelCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      panelWatts: boundedNumber(plan.shared?.panelWatts, defaultEquipmentDefaults.panelWatts, 0),
      batteryCount: boundedNumber(plan.shared?.batteryCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      batteryVoltage: boundedNumber(plan.shared?.batteryVoltage, defaultEquipmentDefaults.batteryVoltage, 0),
      batteryAh: boundedNumber(plan.shared?.batteryAh, defaultEquipmentDefaults.batteryAh, 0),
    },
    dc: {
      controllerProductId: typeof plan.dc?.controllerProductId === "string" ? plan.dc.controllerProductId : undefined,
      controllerCount: boundedNumber(plan.dc?.controllerCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      mpptAmps: boundedNumber(plan.dc?.mpptAmps, defaultEquipmentDefaults.mpptAmpStep, 0),
    },
    hybrid: {
      controllerProductId: typeof plan.hybrid?.controllerProductId === "string" ? plan.hybrid.controllerProductId : undefined,
      inverterProductId: typeof plan.hybrid?.inverterProductId === "string" ? plan.hybrid.inverterProductId : undefined,
      controllerCount: boundedNumber(plan.hybrid?.controllerCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      mpptAmps: boundedNumber(plan.hybrid?.mpptAmps, defaultEquipmentDefaults.mpptAmpStep, 0),
      inverterCount: boundedNumber(plan.hybrid?.inverterCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      inverterWatts: boundedNumber(plan.hybrid?.inverterWatts, defaultEquipmentDefaults.inverterWattStep, 0),
    },
    balance: {
      dcDistributionCount: boundedNumber(plan.balance?.dcDistributionCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      acDistributionCount: boundedNumber(plan.balance?.acDistributionCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      cablingCount: boundedNumber(plan.balance?.cablingCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      earthingCount: boundedNumber(plan.balance?.earthingCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
      monitoringCount: boundedNumber(plan.balance?.monitoringCount, 1, 0, Number.MAX_SAFE_INTEGER, true),
    },
  };
}

function normalizeLoads(value: unknown, fallback: Project["loads"], systemVoltage: number): Project["loads"] {
  if (!Array.isArray(value)) return fallback;
  const ids = new Set<string>();
  return value.map((raw, index) => {
    const load = raw && typeof raw === "object" ? (raw as Partial<Project["loads"][number]>) : {};
    const id = typeof load.id === "string" && load.id && !ids.has(load.id) ? load.id : uid();
    ids.add(id);
    return {
      id,
      name: typeof load.name === "string" && load.name.trim() ? load.name : `Load ${index + 1}`,
      quantity: boundedNumber(load.quantity, 1, 0, Number.MAX_SAFE_INTEGER, true),
      watts: boundedNumber(load.watts, 0, 0),
      hoursPerDay: boundedNumber(load.hoursPerDay, 0, 0, 24),
      currentType: load.currentType === "AC" ? "AC" : "DC",
      voltage: boundedNumber(load.voltage, systemVoltage, 1, 1000),
      surgeMultiplier: boundedNumber(load.surgeMultiplier, 1, 1, 20),
      critical: load.critical === true,
    };
  });
}

export function normalizeProject(rawProject: Partial<Project>): Project {
  const fallback = clone(sampleProjectData) as Project;
  const project = { ...fallback, ...rawProject } as Project;
  const systemVoltage = boundedNumber(project.systemVoltage, fallback.systemVoltage, 12, 100);

  return {
    ...project,
    id: typeof project.id === "string" && project.id ? project.id : uid(),
    name: typeof project.name === "string" && project.name.trim() ? project.name : fallback.name,
    country: typeof project.country === "string" && project.country.trim() ? project.country : fallback.country,
    currency: typeof project.currency === "string" && /^[A-Z]{3}$/.test(project.currency) ? project.currency : "USD",
    usdExchangeRate: typeof project.currency !== "string" || !/^[A-Z]{3}$/.test(project.currency) || project.currency === "USD" ? 1 : boundedNumber(project.usdExchangeRate, 1, 0.000001, 1_000_000),
    systemVoltage,
    sunHours: boundedNumber(project.sunHours, fallback.sunHours, 0.5, 24),
    autonomyDays: boundedNumber(project.autonomyDays, fallback.autonomyDays, 0.5, 30),
    selectedSystem: project.selectedSystem === "dc" || project.selectedSystem === "hybrid" ? project.selectedSystem : "dc",
    equipmentDefaults: {
      panelWatts: boundedNumber(project.equipmentDefaults?.panelWatts, defaultEquipmentDefaults.panelWatts, 1),
      batteryVoltage: boundedNumber(project.equipmentDefaults?.batteryVoltage, defaultEquipmentDefaults.batteryVoltage, 1),
      batteryAh: boundedNumber(project.equipmentDefaults?.batteryAh, defaultEquipmentDefaults.batteryAh, 1),
      mpptAmpStep: boundedNumber(project.equipmentDefaults?.mpptAmpStep, defaultEquipmentDefaults.mpptAmpStep, 1),
      inverterWattStep: boundedNumber(project.equipmentDefaults?.inverterWattStep, defaultEquipmentDefaults.inverterWattStep, 1),
    },
    pricing: normalizePricing(project.pricing),
    equipmentPlanMode: project.equipmentPlanMode ?? "generated",
    equipmentPlan: normalizeEquipmentPlan(project.equipmentPlan),
    loads: normalizeLoads(project.loads, fallback.loads, systemVoltage),
    updatedAt: project.updatedAt ?? new Date().toISOString(),
  };
}

function fallbackState(): AppState {
  const project = normalizeProject(clone(sampleProjectData) as Project);
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    activeProjectId: project.id,
    projects: [project],
    assumptions: normalizeAssumptions(),
    products: defaultProducts,
  };
}

export function loadAppState(storage: Storage | undefined): LoadStateResult {
  const fallback = fallbackState();
  try {
    if (!storage) throw new Error("Storage unavailable");
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return { state: fallback, notice: "" };

    const parsed = JSON.parse(saved) as Partial<AppState>;
    const savedProjects = Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : fallback.projects;
    const projects = savedProjects.map((project) => normalizeProject(project));
    const activeProjectId = projects.some((project) => project.id === parsed.activeProjectId) ? parsed.activeProjectId! : projects[0].id;
    return {
      state: {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        activeProjectId,
        projects,
        assumptions: normalizeAssumptions(parsed.assumptions),
        products: { ...defaultProducts, ...(parsed.products ?? {}) },
      },
      notice: "",
    };
  } catch {
    let recoveryPreserved = false;
    try {
      const damagedState = storage?.getItem(STORAGE_KEY);
      if (damagedState) {
        storage!.setItem(RECOVERY_STORAGE_KEY, damagedState);
        recoveryPreserved = true;
      }
    } catch {
      // Storage may be unavailable entirely; the in-memory fallback still works.
    }
    return {
      state: fallback,
      notice: recoveryPreserved
        ? "Saved project data could not be read. A recovery copy was preserved and the sample project was loaded."
        : "Saved project data could not be read. The sample project was loaded for this session.",
    };
  }
}

export function saveAppState(state: AppState, storage: Storage | undefined): string {
  try {
    if (!storage) throw new Error("Storage unavailable");
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, schemaVersion: STORAGE_SCHEMA_VERSION }));
    return "";
  } catch {
    return "This browser could not save the latest changes. Keep this page open and export the report before leaving.";
  }
}
