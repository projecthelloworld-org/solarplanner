import { Eta } from "eta";
import "./styles.css";
import assumptionsData from "./data/assumptions.json";
import brandProfilesData from "./data/brand-profiles.json";
import productsData from "./data/default-products.json";
import sampleProjectData from "./data/sample-project.json";
import { calculateProject } from "./engine/calculations";
import { estimateCosts } from "./engine/costing";
import { evaluateEquipmentPlan, generateEquipmentPlan, getEquipmentActuals } from "./engine/equipment";
import { buildRecommendations } from "./engine/recommendations";
import reportTemplate from "./templates/report.eta?raw";
import type {
  Assumptions,
  BrandProfile,
  EquipmentDefaults,
  EquipmentEvaluation,
  EquipmentPlan,
  PricingSettings,
  ProductCatalog,
  Project,
  SystemOptionId,
} from "./types/project";

type AppState = {
  activeProjectId: string;
  projects: Project[];
  assumptions: Assumptions;
  products: ProductCatalog;
};

const STORAGE_KEY = "hello-solar-planner-state";
const eta = new Eta();
const app = document.querySelector<HTMLDivElement>("#app");
const brands = brandProfilesData as BrandProfile[];
const defaultProducts = productsData as ProductCatalog;
const currencyOptions = ["USD", "UGX", "KES", "TZS", "RWF", "BIF", "ZMW", "MWK", "ETB", "GHS", "NGN", "EUR", "GBP"];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const uid = () => crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const integerFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const toCents = (value: number): number => Math.round(value * 100) / 100;

const defaultEquipmentDefaults: EquipmentDefaults = {
  panelWatts: 450,
  batteryVoltage: 24,
  batteryAh: 100,
  mpptAmpStep: 10,
  inverterWattStep: 500,
};

function selectedSystemFor(project: Project): SystemOptionId {
  return project.selectedSystem === "dc" || project.selectedSystem === "hybrid" ? project.selectedSystem : "dc";
}

function systemOptionName(systemId: SystemOptionId) {
  return systemId === "dc" ? "Fully DC System" : "Hybrid DC + AC System";
}

const defaultPricing: PricingSettings = {
  panelUnitUsd: defaultProducts.solarPanels[1]?.unitCost ?? 245,
  batteryUnitUsd: defaultProducts.batteries[1]?.unitCost ?? 560,
  controllerUnitUsd: defaultProducts.chargeControllers[1]?.unitCost ?? 260,
  inverterUnitUsd: defaultProducts.hybridInverters[1]?.unitCost ?? 690,
  dcDistributionUnitUsd: defaultProducts.dcDistribution[0]?.unitCost ?? 180,
  acDistributionUnitUsd: defaultProducts.acDistribution[0]?.unitCost ?? 220,
  cablingUnitUsd: defaultProducts.cabling[0]?.unitCost ?? 210,
  earthingUnitUsd: defaultProducts.earthing[0]?.unitCost ?? 190,
  monitoringUnitUsd: defaultProducts.monitoring[0]?.unitCost ?? 155,
};

function normalizePricing(rawPricing: Partial<PricingSettings> & Record<string, unknown> = {}): PricingSettings {
  return {
    panelUnitUsd: toCents(Number(rawPricing.panelUnitUsd ?? Number(rawPricing.panelUsdPerW ?? 0) * defaultEquipmentDefaults.panelWatts) || defaultPricing.panelUnitUsd),
    batteryUnitUsd:
      toCents(
        Number(rawPricing.batteryUnitUsd ?? Number(rawPricing.batteryUsdPerWh ?? 0) * defaultEquipmentDefaults.batteryVoltage * defaultEquipmentDefaults.batteryAh) ||
          defaultPricing.batteryUnitUsd,
      ),
    controllerUnitUsd: toCents(Number(rawPricing.controllerUnitUsd ?? rawPricing.chargeControllerUsd) || defaultPricing.controllerUnitUsd),
    inverterUnitUsd: toCents(Number(rawPricing.inverterUnitUsd ?? Number(rawPricing.inverterUsdPerW ?? 0) * defaultEquipmentDefaults.inverterWattStep) || defaultPricing.inverterUnitUsd),
    dcDistributionUnitUsd: toCents(Number(rawPricing.dcDistributionUnitUsd ?? rawPricing.dcDistributionUsd) || defaultPricing.dcDistributionUnitUsd),
    acDistributionUnitUsd: toCents(Number(rawPricing.acDistributionUnitUsd ?? rawPricing.acDistributionUsd) || defaultPricing.acDistributionUnitUsd),
    cablingUnitUsd: toCents(Number(rawPricing.cablingUnitUsd ?? rawPricing.cablingUsd) || defaultPricing.cablingUnitUsd),
    earthingUnitUsd: toCents(Number(rawPricing.earthingUnitUsd ?? rawPricing.earthingUsd) || defaultPricing.earthingUnitUsd),
    monitoringUnitUsd: toCents(Number(rawPricing.monitoringUnitUsd ?? rawPricing.monitoringUsd) || defaultPricing.monitoringUnitUsd),
  };
}

function normalizeEquipmentPlan(plan: Project["equipmentPlan"]): Project["equipmentPlan"] {
  if (!plan) return undefined;

  return {
    shared: {
      panelCount: plan.shared?.panelCount ?? 1,
      panelWatts: plan.shared?.panelWatts ?? defaultEquipmentDefaults.panelWatts,
      batteryCount: plan.shared?.batteryCount ?? 1,
      batteryVoltage: plan.shared?.batteryVoltage ?? defaultEquipmentDefaults.batteryVoltage,
      batteryAh: plan.shared?.batteryAh ?? defaultEquipmentDefaults.batteryAh,
    },
    dc: {
      controllerCount: plan.dc?.controllerCount ?? 1,
      mpptAmps: plan.dc?.mpptAmps ?? defaultEquipmentDefaults.mpptAmpStep,
    },
    hybrid: {
      controllerCount: plan.hybrid?.controllerCount ?? 1,
      mpptAmps: plan.hybrid?.mpptAmps ?? defaultEquipmentDefaults.mpptAmpStep,
      inverterCount: plan.hybrid?.inverterCount ?? 1,
      inverterWatts: plan.hybrid?.inverterWatts ?? defaultEquipmentDefaults.inverterWattStep,
    },
    balance: {
      dcDistributionCount: plan.balance?.dcDistributionCount ?? 1,
      acDistributionCount: plan.balance?.acDistributionCount ?? 1,
      cablingCount: plan.balance?.cablingCount ?? 1,
      earthingCount: plan.balance?.earthingCount ?? 1,
      monitoringCount: plan.balance?.monitoringCount ?? 1,
    },
  };
}

function normalizeProject(rawProject: Partial<Project>): Project {
  const fallback = clone(sampleProjectData) as Project;
  const project = { ...fallback, ...rawProject } as Project;
  const loads = project.loads ?? fallback.loads;

  return {
    ...project,
    currency: project.currency || "USD",
    usdExchangeRate: Number.isFinite(project.usdExchangeRate) && project.usdExchangeRate > 0 ? project.usdExchangeRate : 1,
    selectedSystem: project.selectedSystem === "dc" || project.selectedSystem === "hybrid" ? project.selectedSystem : "dc",
    equipmentDefaults: { ...defaultEquipmentDefaults, ...(project.equipmentDefaults ?? {}) },
    pricing: normalizePricing(project.pricing as Partial<PricingSettings> & Record<string, unknown>),
    equipmentPlanMode: project.equipmentPlanMode ?? "generated",
    equipmentPlan: normalizeEquipmentPlan(project.equipmentPlan),
    loads,
    updatedAt: project.updatedAt ?? new Date().toISOString(),
  };
}

function loadState(): AppState {
  const fallbackProject = normalizeProject(clone(sampleProjectData) as Project);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AppState>;
      const projects = (parsed.projects ?? [fallbackProject]).map((project) => normalizeProject(project));
      return {
        activeProjectId: parsed.activeProjectId ?? projects[0].id,
        projects,
        assumptions: { ...(assumptionsData as Assumptions), ...(parsed.assumptions ?? {}) },
        products: { ...defaultProducts, ...(parsed.products ?? {}) },
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    activeProjectId: fallbackProject.id,
    projects: [fallbackProject],
    assumptions: assumptionsData as Assumptions,
    products: defaultProducts,
  };
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeProject(): Project {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
}

function setActiveProject(project: Project) {
  project.updatedAt = new Date().toISOString();
  state.projects = state.projects.map((item) => (item.id === project.id ? normalizeProject(project) : item));
  saveState();
  render();
}

function currentPlan(project: Project, generatedPlan: EquipmentPlan): EquipmentPlan {
  return project.equipmentPlanMode === "custom" && project.equipmentPlan ? project.equipmentPlan : generatedPlan;
}

function money(value: number, project = activeProject()) {
  return `${project.currency} ${integerFormat.format(value)}`;
}

function moneyDetailed(value: number, project = activeProject()) {
  return `${project.currency} ${decimalFormat.format(value)}`;
}

function moneyUsd(value: number) {
  return `USD ${decimalFormat.format(value)}`;
}

function formatEnergy(wh: number) {
  return wh >= 1000 ? `${decimalFormat.format(wh / 1000)} kWh` : `${integerFormat.format(wh)} Wh`;
}

function formatStatus(evaluation: EquipmentEvaluation) {
  return `<span class="status-pill ${evaluation.status === "Pass" ? "pass" : "warn"}">${evaluation.status}</span>`;
}

function getProjectBundle(project: Project) {
  const result = calculateProject(project, state.assumptions);
  const generatedPlan = generateEquipmentPlan(result, project.equipmentDefaults);
  const plan = currentPlan(project, generatedPlan);
  const evaluations = {
    dc: evaluateEquipmentPlan(result, plan, "dc"),
    hybrid: evaluateEquipmentPlan(result, plan, "hybrid"),
  };
  const costs = [
    estimateCosts(project, plan, project.pricing, state.assumptions, "dc"),
    estimateCosts(project, plan, project.pricing, state.assumptions, "hybrid"),
  ];

  return {
    result,
    generatedPlan,
    plan,
    actuals: getEquipmentActuals(plan),
    evaluations,
    costs,
    recommendations: buildRecommendations(project, result),
  };
}

function getSelectedReportBundle(project: Project) {
  const bundle = getProjectBundle(project);
  const selectedSystem = selectedSystemFor(project);
  const selectedSizing = selectedSystem === "dc" ? bundle.result.dc : bundle.result.hybrid;
  const selectedEvaluation = selectedSystem === "dc" ? bundle.evaluations.dc : bundle.evaluations.hybrid;
  const selectedCost = bundle.costs.find((estimate) => estimate.systemId === selectedSystem) ?? bundle.costs[0];
  const selectedRecommendation = bundle.recommendations.find((option) => option.id === selectedSystem) ?? bundle.recommendations[0];

  return {
    ...bundle,
    selectedSystem,
    selectedSystemName: systemOptionName(selectedSystem),
    selectedSizing,
    selectedEvaluation,
    selectedCost,
    selectedRecommendation,
  };
}

function renderReport(project: Project): string {
  const bundle = getSelectedReportBundle(project);
  const brand = brands.find((item) => item.id === project.brandProfileId) ?? brands[0];

  return eta.renderString(reportTemplate, {
    project,
    ...bundle,
    assumptions: state.assumptions,
    brand,
    generatedAt: new Date().toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }),
    money: (value: number) => money(value, project),
    moneyDetailed: (value: number) => moneyDetailed(value, project),
    moneyUsd,
    formatEnergy,
    formatNumber: (value: number) => integerFormat.format(value),
    formatDecimal: (value: number) => decimalFormat.format(value),
    formatPercent: (value: number) => `${Math.round(value * 100)}%`,
  }) as string;
}

function csvCell(value: string | number | boolean | undefined) {
  const text = value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvLine(values: Array<string | number | boolean | undefined>) {
  return values.map(csvCell).join(",");
}

function buildCsvExport(project: Project) {
  const bundle = getSelectedReportBundle(project);
  const brand = brands.find((item) => item.id === project.brandProfileId) ?? brands[0];
  const rows: Array<Array<string | number | boolean | undefined>> = [];
  const selectedLines = bundle.selectedRecommendation.lines;

  rows.push(["Project Summary"]);
  rows.push(["Country", project.country]);
  rows.push(["Currency", project.currency]);
  rows.push(["USD exchange rate", `1 USD = ${decimalFormat.format(project.usdExchangeRate)} ${project.currency}`]);
  rows.push(["System voltage", `${project.systemVoltage} V`]);
  rows.push(["Sun hours", `${project.sunHours} h/day`]);
  rows.push(["Autonomy", `${project.autonomyDays} day(s)`]);
  rows.push(["Report option", bundle.selectedSystemName]);
  rows.push(["Brand profile", brand.name]);
  rows.push([]);

  rows.push(["Load Table"]);
  rows.push(["Load", "Qty", "W each", "h/day", "Type", "Voltage", "Surge", "Critical", "Daily Wh"]);
  bundle.result.loadRows.forEach((row) => {
    rows.push([
      row.load.name,
      row.load.quantity,
      row.load.watts,
      row.load.hoursPerDay,
      row.load.currentType,
      `${row.load.voltage} V`,
      `${row.load.surgeMultiplier}x`,
      row.load.critical ? "Yes" : "No",
      Math.round(row.dailyWh),
    ]);
  });
  rows.push(["Total daily energy", "", "", "", "", "", "", "", Math.round(bundle.result.totalDailyWh)]);
  rows.push([]);

  rows.push(["Technical Sizing Summary", bundle.selectedSystemName]);
  rows.push(["Adjusted daily energy", formatEnergy(bundle.selectedSizing.adjustedDailyWh)]);
  rows.push(["Required LiFePO4 battery", formatEnergy(bundle.selectedSizing.requiredBatteryWh)]);
  rows.push(["Recommended solar array", `${integerFormat.format(bundle.selectedSizing.recommendedSolarArrayW)} W`]);
  rows.push(["Recommended MPPT current", `${bundle.selectedSizing.recommendedMpptCurrentA} A`]);
  rows.push(["Recommended inverter size", bundle.selectedSystem === "hybrid" ? `${integerFormat.format(bundle.selectedSizing.recommendedInverterW)} W` : "Not required"]);
  rows.push([]);

  rows.push(["Generated / Edited Equipment Plan"]);
  rows.push(["Equipment", "Current plan", "Actual capacity", "Notes"]);
  rows.push([
    "Solar panels",
    `${bundle.plan.shared.panelCount} panel(s) x ${bundle.plan.shared.panelWatts} W`,
    `${integerFormat.format(bundle.actuals.solarArrayW)} W`,
    `${integerFormat.format(bundle.selectedSizing.recommendedSolarArrayW)} W`,
  ]);
  rows.push([
    "LiFePO4 batteries",
    `${bundle.plan.shared.batteryCount} battery/batteries x ${bundle.plan.shared.batteryVoltage} V x ${bundle.plan.shared.batteryAh} Ah`,
    formatEnergy(bundle.actuals.batteryWh),
    formatEnergy(bundle.selectedSizing.requiredBatteryWh),
  ]);
  if (bundle.selectedSystem === "dc") {
    rows.push(["DC MPPT/controller", `${bundle.plan.dc.controllerCount} controller(s) x ${bundle.plan.dc.mpptAmps} A`, `${bundle.plan.dc.mpptAmps} A`, `${bundle.selectedSizing.recommendedMpptCurrentA} A`]);
  } else {
    rows.push([
      "Hybrid MPPT/controller",
      `${bundle.plan.hybrid.controllerCount} controller(s) x ${bundle.plan.hybrid.mpptAmps} A`,
      `${bundle.plan.hybrid.mpptAmps} A`,
      `${bundle.selectedSizing.recommendedMpptCurrentA} A`,
    ]);
    rows.push([
      "Hybrid inverter",
      `${bundle.plan.hybrid.inverterCount} inverter(s) x ${bundle.plan.hybrid.inverterWatts} W`,
      `${integerFormat.format(bundle.actuals.hybridInverterW)} W`,
      `${integerFormat.format(bundle.selectedSizing.recommendedInverterW)} W`,
    ]);
  }
  rows.push([]);

  rows.push([bundle.selectedRecommendation.name]);
  rows.push(["Status", bundle.selectedEvaluation.status]);
  if (bundle.selectedEvaluation.warnings.length > 0) {
    bundle.selectedEvaluation.warnings.forEach((warning) => rows.push(["Warning", warning]));
  }
  rows.push(["Summary", bundle.selectedRecommendation.summary]);
  rows.push(["Category", "Recommendation", "Rationale"]);
  selectedLines.forEach((line) => rows.push([line.category, line.recommendation, line.rationale]));
  rows.push([]);

  rows.push(["Financial Summary", bundle.selectedSystemName]);
  rows.push([`${bundle.selectedSystemName} option`, money(bundle.selectedCost.total, project)]);
  rows.push([]);
  rows.push([`${bundle.selectedSystemName} Cost Detail`]);
  rows.push(["Category", "Description", "Qty", "Unit cost", "Total"]);
  bundle.selectedCost.lines.forEach((line) => {
    rows.push([line.category, line.description, line.quantity, `${moneyDetailed(line.unitCost, project)} (${moneyUsd(line.unitCostUsd)})`, money(line.total, project)]);
  });
  rows.push(["Installation", "Planning allowance based on editable assumption", 1, `${Math.round(state.assumptions.installationRate * 100)}%`, money(bundle.selectedCost.installation, project)]);
  rows.push(["Contingency", "Planning allowance for local variance and missing items", 1, `${Math.round(state.assumptions.contingencyRate * 100)}%`, money(bundle.selectedCost.contingency, project)]);
  rows.push(["Estimated total", "", "", "", `${money(bundle.selectedCost.total, project)} (${moneyUsd(bundle.selectedCost.totalUsd)})`]);

  return rows.map(csvLine).join("\n");
}

function csvFilename(project: Project) {
  return `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "hello-solar-report"}-report.csv`;
}

function csvDownloadHref(project: Project) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${buildCsvExport(project)}`)}`;
}

function attribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function input(label: string, attrs: string, value: string | number) {
  return `
    <label>
      <span>${label}</span>
      <input ${attrs} value="${String(value)}" />
    </label>
  `;
}

function renderProjectPanel(project: Project) {
  return `
    <section class="panel project-panel">
      <div class="section-heading">
        <span>Project</span>
        <strong>${project.name}</strong>
      </div>
      <div class="form-grid">
        ${input("Project name", 'type="text" data-project-field="name"', project.name)}
        ${input("Country", 'type="text" data-project-field="country"', project.country)}
        ${input("System voltage", 'type="number" min="12" step="12" data-project-field="systemVoltage"', project.systemVoltage)}
        ${input("Sun hours", 'type="number" min="0.5" step="0.1" data-project-field="sunHours"', project.sunHours)}
        ${input("Autonomy days", 'type="number" min="0.5" step="0.5" data-project-field="autonomyDays"', project.autonomyDays)}
        <label>
          <span>System Option</span>
          <select data-project-field="selectedSystem">
            <option value="dc" ${selectedSystemFor(project) === "dc" ? "selected" : ""}>Fully DC</option>
            <option value="hybrid" ${selectedSystemFor(project) === "hybrid" ? "selected" : ""}>Hybrid DC + AC</option>
          </select>
        </label>
        <label>
          <span>Brand profile</span>
          <select data-project-field="brandProfileId">
            ${brands.map((item) => `<option value="${item.id}" ${item.id === project.brandProfileId ? "selected" : ""}>${item.name}</option>`).join("")}
          </select>
          <em>Report branding only</em>
        </label>
      </div>
    </section>
  `;
}

function numberField(label: string, attrs: string, value: number, help = "") {
  return `
    <label>
      <span>${label}</span>
      <input ${attrs} value="${String(value)}" />
      ${help ? `<em>${help}</em>` : ""}
    </label>
  `;
}

function renderLoadRows(project: Project) {
  return project.loads
    .map(
      (load) => `
      <tr data-load-row data-load-id="${load.id}">
        <td><input aria-label="Load name" data-load-id="${load.id}" data-load-field="name" value="${load.name}" /></td>
        <td><input aria-label="Quantity" type="number" min="0" step="1" data-load-id="${load.id}" data-load-field="quantity" value="${load.quantity}" /></td>
        <td><input aria-label="Watts" type="number" min="0" step="1" data-load-id="${load.id}" data-load-field="watts" value="${load.watts}" /></td>
        <td><input aria-label="Hours per day" type="number" min="0" step="0.25" data-load-id="${load.id}" data-load-field="hoursPerDay" value="${load.hoursPerDay}" /></td>
        <td>
          <select aria-label="Current type" data-load-id="${load.id}" data-load-field="currentType">
            <option value="DC" ${load.currentType === "DC" ? "selected" : ""}>DC</option>
            <option value="AC" ${load.currentType === "AC" ? "selected" : ""}>AC</option>
          </select>
        </td>
        <td><input aria-label="Voltage" type="number" min="0" step="1" data-load-id="${load.id}" data-load-field="voltage" value="${load.voltage}" /></td>
        <td><input aria-label="Surge multiplier" type="number" min="1" step="0.1" data-load-id="${load.id}" data-load-field="surgeMultiplier" value="${load.surgeMultiplier}" /></td>
        <td>
          <label class="check-cell">
            <input type="checkbox" data-load-id="${load.id}" data-load-field="critical" ${load.critical ? "checked" : ""} />
            <span>Critical</span>
          </label>
        </td>
        <td><button class="icon-button" type="button" data-remove-load="${load.id}" aria-label="Remove ${load.name}">x</button></td>
      </tr>
    `,
    )
    .join("");
}

function hardwareInput(label: string, section: string, field: string, value: number, step = 1) {
  return input(label, `type="number" min="0" step="${step}" data-hardware-section="${section}" data-hardware-field="${field}"`, value);
}

function priceInput(label: string, field: keyof PricingSettings, value: number) {
  return numberField(label, `type="number" min="0" step="0.01" data-pricing-field="${field}"`, value, "USD unit price");
}

function renderSideControls(project: Project, plan: EquipmentPlan, evaluations: { dc: EquipmentEvaluation; hybrid: EquipmentEvaluation }, generatedPlan: EquipmentPlan) {
  return `
    <section class="panel equipment-panel">
      <div class="panel-title-row">
        <div class="section-heading">
          <span>Equipment & pricing</span>
          <strong>${project.equipmentPlanMode === "custom" ? "Edited plan" : "Load-generated plan"}</strong>
        </div>
        <button type="button" data-reset-equipment>Use generated values</button>
      </div>

      <div class="accordion-list">
        <details>
          <summary>Currency</summary>
          <div class="accordion-body mini-grid">
            <label>
              <span>Currency</span>
              <select data-project-field="currency">
                ${currencyOptions.map((currency) => `<option value="${currency}" ${project.currency === currency ? "selected" : ""}>${currency}</option>`).join("")}
              </select>
            </label>
            ${numberField("USD exchange rate", 'type="number" min="0" step="0.01" data-project-field="usdExchangeRate"', project.usdExchangeRate, `1 USD in ${project.currency}`)}
          </div>
        </details>

        <details open>
          <summary>Solar Panels</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Panels", "shared", "panelCount", plan.shared.panelCount)}
            ${hardwareInput("Watts each", "shared", "panelWatts", plan.shared.panelWatts)}
            ${priceInput("Price per panel", "panelUnitUsd", project.pricing.panelUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${generatedPlan.shared.panelCount} panel(s) x ${generatedPlan.shared.panelWatts} W. Current array: ${integerFormat.format(plan.shared.panelCount * plan.shared.panelWatts)} W.</p>
        </details>

        <details>
          <summary>Batteries</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Batteries", "shared", "batteryCount", plan.shared.batteryCount)}
            ${hardwareInput("Voltage", "shared", "batteryVoltage", plan.shared.batteryVoltage)}
            ${hardwareInput("Ah each", "shared", "batteryAh", plan.shared.batteryAh)}
            ${priceInput("Price per battery", "batteryUnitUsd", project.pricing.batteryUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${generatedPlan.shared.batteryCount} battery/batteries x ${generatedPlan.shared.batteryVoltage} V x ${generatedPlan.shared.batteryAh} Ah. Current storage: ${formatEnergy(plan.shared.batteryCount * plan.shared.batteryVoltage * plan.shared.batteryAh)}.</p>
        </details>

        <details>
          <summary>DC Controller</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Controllers", "dc", "controllerCount", plan.dc.controllerCount)}
            ${hardwareInput("MPPT amps", "dc", "mpptAmps", plan.dc.mpptAmps)}
            ${priceInput("Price per controller", "controllerUnitUsd", project.pricing.controllerUnitUsd)}
          </div>
          ${renderWarnings(evaluations.dc)}
        </details>

        <details>
          <summary>Hybrid Inverter</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Controllers", "hybrid", "controllerCount", plan.hybrid.controllerCount)}
            ${hardwareInput("MPPT amps", "hybrid", "mpptAmps", plan.hybrid.mpptAmps)}
            ${hardwareInput("Inverters", "hybrid", "inverterCount", plan.hybrid.inverterCount)}
            ${hardwareInput("Watts each", "hybrid", "inverterWatts", plan.hybrid.inverterWatts)}
            ${priceInput("Price per inverter", "inverterUnitUsd", project.pricing.inverterUnitUsd)}
          </div>
          ${renderWarnings(evaluations.hybrid)}
        </details>

        <details>
          <summary>DC Distribution</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "dcDistributionCount", plan.balance.dcDistributionCount)}
            ${priceInput("Price per set", "dcDistributionUnitUsd", project.pricing.dcDistributionUnitUsd)}
          </div>
        </details>

        <details>
          <summary>AC Distribution</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "acDistributionCount", plan.balance.acDistributionCount)}
            ${priceInput("Price per set", "acDistributionUnitUsd", project.pricing.acDistributionUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Cabling</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "cablingCount", plan.balance.cablingCount)}
            ${priceInput("Price per kit", "cablingUnitUsd", project.pricing.cablingUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Earthing</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "earthingCount", plan.balance.earthingCount)}
            ${priceInput("Price per kit", "earthingUnitUsd", project.pricing.earthingUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Monitoring</summary>
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "monitoringCount", plan.balance.monitoringCount)}
            ${priceInput("Price per kit", "monitoringUnitUsd", project.pricing.monitoringUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Sizing Assumptions</summary>
          <div class="accordion-body mini-grid">
            ${numberField("Default panel W", 'type="number" min="1" step="1" data-default-field="panelWatts"', project.equipmentDefaults.panelWatts)}
            ${numberField("Default battery V", 'type="number" min="1" step="1" data-default-field="batteryVoltage"', project.equipmentDefaults.batteryVoltage)}
            ${numberField("Default battery Ah", 'type="number" min="1" step="1" data-default-field="batteryAh"', project.equipmentDefaults.batteryAh)}
            ${numberField("MPPT amp step", 'type="number" min="1" step="1" data-default-field="mpptAmpStep"', project.equipmentDefaults.mpptAmpStep)}
            ${numberField("Inverter W step", 'type="number" min="1" step="1" data-default-field="inverterWattStep"', project.equipmentDefaults.inverterWattStep)}
            ${[
              ["dcDistributionEfficiency", "DC efficiency"],
              ["hybridDcEfficiency", "Hybrid DC efficiency"],
              ["inverterEfficiency", "Inverter efficiency"],
              ["batteryDepthOfDischarge", "Battery DoD"],
              ["batteryReserveFactor", "Battery reserve"],
              ["arrayDerateFactor", "PV derate"],
              ["mpptSafetyFactor", "MPPT safety"],
              ["inverterHeadroomFactor", "Inverter headroom"],
              ["installationRate", "Installation rate"],
              ["contingencyRate", "Contingency rate"],
            ]
              .map(([field, label]) => numberField(label, `type="number" min="0" max="3" step="0.01" data-assumption-field="${field}"`, state.assumptions[field as keyof Assumptions] as number))
              .join("")}
          </div>
        </details>
      </div>
    </section>
  `;
}

function renderWarnings(evaluation: EquipmentEvaluation) {
  if (evaluation.warnings.length === 0) return `<p class="pass-note">This option can handle the calculated load.</p>`;

  return `
    <ul class="warning-list">
      ${evaluation.warnings.map((warning) => `<li>${warning}</li>`).join("")}
    </ul>
  `;
}

function renderPlanner(project: Project) {
  const { result, generatedPlan, plan, evaluations, costs, recommendations } = getProjectBundle(project);
  const [dcCost, hybridCost] = costs;
  const selectedSystem = selectedSystemFor(project);

  return `
    <main class="planner-grid">
      <div class="side-column">
        ${renderProjectPanel(project)}
        ${renderSideControls(project, plan, evaluations, generatedPlan)}
      </div>

      <div class="main-column">
        <section class="panel metrics-panel">
          <div class="metric"><span>Total daily Wh</span><strong>${formatEnergy(result.totalDailyWh)}</strong></div>
          <div class="metric"><span>Peak load</span><strong>${integerFormat.format(result.peakLoadW)} W</strong></div>
          <div class="metric"><span>Surge load</span><strong>${integerFormat.format(result.surgeLoadW)} W</strong></div>
          <div class="metric"><span>Critical load energy</span><strong>${formatEnergy(result.criticalDailyWh)}</strong></div>
        </section>

        <section class="panel loads-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Loads</span>
              <strong>${project.loads.length} device groups</strong>
            </div>
            <div class="load-actions">
              <button type="button" data-calculate-loads>Calculate</button>
              <button type="button" data-add-load>Add load</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="editable-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>W</th>
                  <th>h/day</th>
                  <th>Type</th>
                  <th>V</th>
                  <th>Surge</th>
                  <th>Critical</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${renderLoadRows(project)}</tbody>
            </table>
          </div>
        </section>

        <section class="panel recommendations-panel">
          <div class="section-heading">
            <span>System options</span>
            <strong>Two planning paths</strong>
          </div>
          <div class="option-grid">
            ${recommendations
              .map((option) => {
                const sizing = option.id === "dc" ? result.dc : result.hybrid;
                const evaluation = option.id === "dc" ? evaluations.dc : evaluations.hybrid;
                const estimate = option.id === "dc" ? dcCost : hybridCost;
                const isSelected = option.id === selectedSystem;
                return `
                  <article class="option-card ${isSelected ? "selected-option" : ""}">
                    <div class="card-heading">
                      <div>
                        <h2>${option.name}</h2>
                        ${isSelected ? `<span class="report-choice">Included in report</span>` : ""}
                      </div>
                      ${formatStatus(evaluation)}
                    </div>
                    <p>${option.summary}</p>
                    <dl>
                      <div><dt>Adjusted energy</dt><dd>${formatEnergy(sizing.adjustedDailyWh)}</dd></div>
                      <div><dt>Battery requirement</dt><dd>${formatEnergy(sizing.requiredBatteryWh)}</dd></div>
                      <div><dt>Solar requirement</dt><dd>${integerFormat.format(sizing.recommendedSolarArrayW)} W</dd></div>
                      <div><dt>MPPT requirement</dt><dd>${sizing.recommendedMpptCurrentA} A</dd></div>
                      ${option.id === "hybrid" ? `<div><dt>Inverter requirement</dt><dd>${integerFormat.format(sizing.recommendedInverterW)} W</dd></div>` : ""}
                      <div><dt>Estimate</dt><dd>${money(estimate.total, project)}</dd></div>
                    </dl>
                    ${renderWarnings(evaluation)}
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      </div>
    </main>

    <section class="panel report-panel">
      <details class="report-details" data-report-details>
        <summary class="report-summary">
          <div class="section-heading">
            <span>Report generation</span>
            <strong>${systemOptionName(selectedSystem)} report</strong>
          </div>
        </summary>
        <div class="report-body">
          <div class="panel-title-row report-toolbar">
            <div class="section-heading">
              <span>Report actions</span>
              <strong>Print or export this selected option</strong>
            </div>
            <div class="report-actions">
              <button type="button" data-print>Print / Save PDF</button>
              <a class="button-link" href="${attribute(csvDownloadHref(project))}" download="${attribute(csvFilename(project))}" target="_blank" rel="noopener" data-export-csv>Export CSV</a>
            </div>
          </div>
          <div id="report">${renderReport(project)}</div>
        </div>
      </details>
    </section>
  `;
}

function render() {
  if (!app) return;

  const project = activeProject();
  const brand = brands.find((item) => item.id === project.brandProfileId) ?? brands[0];
  document.documentElement.style.setProperty("--brand", brand.primaryColor);
  document.documentElement.style.setProperty("--accent", brand.accentColor);

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div>
          <p>${brand.name}</p>
          <h1>Hello Solar Planner</h1>
        </div>
        <div class="top-actions">
          <select data-project-switch aria-label="Switch project">
            ${state.projects.map((item) => `<option value="${item.id}" ${item.id === project.id ? "selected" : ""}>${item.name}</option>`).join("")}
          </select>
          <button type="button" data-new-project>New</button>
          <button type="button" data-load-sample>Sample</button>
        </div>
      </header>
      ${renderPlanner(project)}
    </div>
  `;

  bindEvents();
}

function collectLoadTable(project: Project): Project["loads"] {
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>("[data-load-row]"));
  if (rows.length === 0) return project.loads;

  const readField = (row: HTMLTableRowElement, field: string) =>
    row.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-load-field="${field}"]`);
  const readNumber = (row: HTMLTableRowElement, field: string, fallback: number) => {
    const value = Number(readField(row, field)?.value);
    return Number.isFinite(value) ? value : fallback;
  };

  return rows.map((row) => {
    const id = row.dataset.loadId ?? uid();
    const current = project.loads.find((load) => load.id === id);
    const currentType = readField(row, "currentType")?.value;
    const criticalInput = readField(row, "critical");

    return {
      id,
      name: readField(row, "name")?.value ?? current?.name ?? "Load",
      quantity: readNumber(row, "quantity", current?.quantity ?? 0),
      watts: readNumber(row, "watts", current?.watts ?? 0),
      hoursPerDay: readNumber(row, "hoursPerDay", current?.hoursPerDay ?? 0),
      currentType: currentType === "AC" ? "AC" : "DC",
      voltage: readNumber(row, "voltage", current?.voltage ?? project.systemVoltage),
      surgeMultiplier: readNumber(row, "surgeMultiplier", current?.surgeMultiplier ?? 1),
      critical: criticalInput instanceof HTMLInputElement ? criticalInput.checked : (current?.critical ?? false),
    };
  });
}

function bindEvents() {
  document.querySelector("[data-project-switch]")?.addEventListener("change", (event) => {
    state.activeProjectId = (event.target as HTMLSelectElement).value;
    saveState();
    render();
  });

  document.querySelectorAll("[data-project-field]").forEach((inputElement) => {
    const numericFields = new Set<keyof Project>(["systemVoltage", "sunHours", "autonomyDays", "usdExchangeRate"]);
    const updateProjectField = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      const project = clone(activeProject());
      const field = target.dataset.projectField as keyof Project;
      (project[field] as string | number) = numericFields.has(field) ? Number(target.value) : target.value;
      setActiveProject(project);
    };

    inputElement.addEventListener("change", updateProjectField);
    if (inputElement instanceof HTMLInputElement && numericFields.has(inputElement.dataset.projectField as keyof Project)) {
      inputElement.addEventListener("input", updateProjectField);
    }
  });

  document.querySelector("[data-calculate-loads]")?.addEventListener("click", () => {
    const project = clone(activeProject());
    project.loads = collectLoadTable(project);
    setActiveProject(project);
  });

  document.querySelectorAll("[data-remove-load]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = clone(activeProject());
      project.loads = collectLoadTable(project).filter((load) => load.id !== (button as HTMLButtonElement).dataset.removeLoad);
      setActiveProject(project);
    });
  });

  document.querySelector("[data-add-load]")?.addEventListener("click", () => {
    const project = clone(activeProject());
    project.loads = collectLoadTable(project);
    project.loads.push({
      id: uid(),
      name: "New load",
      quantity: 1,
      watts: 10,
      hoursPerDay: 4,
      currentType: "DC",
      voltage: project.systemVoltage,
      surgeMultiplier: 1.1,
      critical: false,
    });
    setActiveProject(project);
  });

  document.querySelectorAll("[data-hardware-field]").forEach((inputElement) => {
    const updateHardware = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const project = clone(activeProject());
      const generatedPlan = generateEquipmentPlan(calculateProject(project, state.assumptions), project.equipmentDefaults);
      const plan = clone(currentPlan(project, generatedPlan));
      const section = target.dataset.hardwareSection as keyof EquipmentPlan;
      const field = target.dataset.hardwareField ?? "";
      (plan[section] as unknown as Record<string, number>)[field] = Number(target.value);
      project.equipmentPlan = plan;
      project.equipmentPlanMode = "custom";
      setActiveProject(project);
    };

    inputElement.addEventListener("input", updateHardware);
    inputElement.addEventListener("change", updateHardware);
  });

  document.querySelector("[data-reset-equipment]")?.addEventListener("click", () => {
    const project = clone(activeProject());
    project.equipmentPlan = undefined;
    project.equipmentPlanMode = "generated";
    setActiveProject(project);
  });

  document.querySelectorAll("[data-default-field]").forEach((inputElement) => {
    inputElement.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const project = clone(activeProject());
      const field = target.dataset.defaultField as keyof EquipmentDefaults;
      project.equipmentDefaults[field] = Number(target.value);
      setActiveProject(project);
    });
  });

  document.querySelectorAll("[data-pricing-field]").forEach((inputElement) => {
    const updatePricing = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const project = clone(activeProject());
      const field = target.dataset.pricingField as keyof PricingSettings;
      project.pricing[field] = Number(target.value);
      setActiveProject(project);
    };

    inputElement.addEventListener("input", updatePricing);
    inputElement.addEventListener("change", updatePricing);
  });

  document.querySelectorAll("[data-assumption-field]").forEach((inputElement) => {
    inputElement.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const field = target.dataset.assumptionField as keyof Assumptions;
      (state.assumptions[field] as number) = Number(target.value);
      saveState();
      render();
    });
  });

  document.querySelector("[data-new-project]")?.addEventListener("click", () => {
    const project = normalizeProject(clone(sampleProjectData) as Project);
    project.id = uid();
    project.name = "Untitled solar project";
    project.updatedAt = new Date().toISOString();
    state.projects = [...state.projects, project];
    state.activeProjectId = project.id;
    saveState();
    render();
  });

  document.querySelector("[data-load-sample]")?.addEventListener("click", () => {
    const sample = normalizeProject(clone(sampleProjectData) as Project);
    sample.id = uid();
    sample.updatedAt = new Date().toISOString();
    state.projects = [...state.projects, sample];
    state.activeProjectId = sample.id;
    saveState();
    render();
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector<HTMLDetailsElement>("[data-report-details]")?.setAttribute("open", "");
      window.print();
    });
  });

}

window.addEventListener("beforeprint", () => {
  document.querySelector<HTMLDetailsElement>("[data-report-details]")?.setAttribute("open", "");
});

render();
