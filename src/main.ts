import "./styles.css";
import solarPlannerLogoUrl from "./assets/solar_planner_logo.svg";
import brandProfilesData from "./data/brand-profiles.json";
import sampleProjectData from "./data/sample-project.json";
import { loadAppState, normalizeProject, saveAppState } from "./app/persistence";
import { calculateProject } from "./engine/calculations";
import { generateEquipmentPlan, inverterDescription, requiredControllerAmps, supplementaryControllers } from "./engine/equipment";
import productsData from "./data/default-products.json";
import { currentPlan, getProjectBundle } from "./engine/planner";
import { validateAssumptions, validateEquipmentPlan, validateProject, type ValidationIssue } from "./engine/validation";
import { createCsvObjectUrl } from "./exports/csv";
import { buildProjectCsv, projectCsvFilename, renderProjectReport } from "./exports/project-report";
import type {
  Assumptions,
  BrandProfile,
  EquipmentDefaults,
  EquipmentEvaluation,
  EquipmentPlan,
  PricingSettings,
  Project,
  ProductCatalog,
} from "./types/project";
import { attribute, clone, escapeHtml, uid } from "./utils/html";
import { decimalFormat, formatEnergy, integerFormat, money, moneyUsd, selectedSystemFor, systemOptionName } from "./utils/format";

const app = document.querySelector<HTMLDivElement>("#app");
const catalog = productsData as ProductCatalog;

function productSelect(label: string, category: "batteries" | "hybridInverters" | "chargeControllers", selection: string | undefined, target: string) {
  return `<label><span>${label}</span><select data-product-target="${target}" data-product-category="${category}">
    <option value="" ${selection ? "" : "selected"}>Custom / unverified</option>
    ${catalog[category].map((item) => `<option value="${attribute(item.id)}" ${selection === item.id ? "selected" : ""}>${escapeHtml(item.name)} (${moneyUsd(item.unitCost)})</option>`).join("")}
  </select></label>`;
}

function productPriceNote(category: keyof ProductCatalog, id: string | undefined): string {
  const item = catalog[category].find((product) => product.id === id);
  if (!item) return "No matched reference: obtain a quote and reviewed specifications.";
  const basis = item.priceEvidence?.some((source) => source.basis === "comparable-class") ? "Price includes comparable-class evidence; obtain a matching quote. " : "";
  return `${basis}${item.priceNotes ?? "USD planning allowance; confirm the exact model and delivery/tax costs."}`;
}
const brands = brandProfilesData as BrandProfile[];
const currencyOptions = ["USD", "UGX", "KES", "TZS", "RWF", "BIF", "ZMW", "MWK", "ETB", "GHS", "NGN", "EUR", "GBP"];
let storage: Storage | undefined;
try { storage = window.localStorage; } catch { /* Private browsers can deny access to the storage getter. */ }
const loaded = loadAppState(storage);
let state = loaded.state;
let persistenceNotice = loaded.notice;
let reportVisible = false;
let csvObjectUrl = "";
const loadDrafts = new Map<string, Project["loads"]>();

function hasPendingLoads(): boolean {
  return loadDrafts.has(activeProject().id);
}

function hasPendingInputs(): boolean {
  return hasPendingLoads() || Boolean(document.querySelector("[data-pending]"));
}

function updatePendingState() {
  const pending = hasPendingLoads();
  const notice = document.querySelector<HTMLElement>("[data-load-status]");
  if (notice) notice.textContent = pending ? "Load changes pending. Calculate to update sizing and the report." : "Calculations are up to date.";
  const reportContent = document.querySelector<HTMLElement>("[data-report-content]");
  const reportNotice = document.querySelector<HTMLElement>("[data-report-pending]");
  if (reportContent) reportContent.hidden = hasPendingInputs();
  if (reportNotice) {
    reportNotice.hidden = !hasPendingInputs();
    reportNotice.textContent = pending ? "Load changes pending. Calculate before generating or exporting the report." : "Finish or correct the edited project or equipment value before exporting the report.";
  }
  document.body.classList.toggle("plan-pending", hasPendingInputs());
}

function saveState() {
  persistenceNotice = saveAppState(state, storage);
  const notice = document.querySelector<HTMLElement>("[data-persistence-notice]");
  if (notice) { notice.textContent = persistenceNotice; notice.hidden = !persistenceNotice; }
}

function activeProject(): Project {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
}

interface EquipmentUiState {
  openDetails: number[];
  scrollPosition: number;
  focusedIndex: number;
  tableScroll: number;
}

function captureEquipmentUiState(): EquipmentUiState {
  const openDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>(".equipment-panel details")).reduce<number[]>((open, detail, index) => {
    if (detail.open) open.push(index);
    return open;
  }, []);

  return { openDetails, scrollPosition: window.scrollY,
    focusedIndex: Array.from(document.querySelectorAll("input, select, button, summary, a")).indexOf(document.activeElement!),
    tableScroll: document.querySelector(".table-wrap")?.scrollLeft ?? 0 };
}

function restoreEquipmentUiState(uiState: EquipmentUiState) {
  const details = document.querySelectorAll<HTMLDetailsElement>(".equipment-panel details");
  details.forEach((detail, index) => { detail.open = uiState.openDetails.includes(index); });
  document.querySelectorAll<HTMLElement>("input, select, button, summary, a")[uiState.focusedIndex]?.focus({ preventScroll: true });
  const table = document.querySelector(".table-wrap");
  if (table) table.scrollLeft = uiState.tableScroll;
  window.scrollTo({ top: uiState.scrollPosition, behavior: "instant" });
}

function setActiveProject(project: Project, preserveEquipmentUi = false) {
  project.updatedAt = new Date().toISOString();
  state.projects = state.projects.map((item) => (item.id === project.id ? normalizeProject(project) : item));
  saveState();
  if (preserveEquipmentUi) refreshResults();
  else render();

}

function formatStatus(evaluation: EquipmentEvaluation) {
  return `<span class="status-pill ${evaluation.status === "Preliminary checks met" ? "pass" : "warn"}">${evaluation.status}</span>`;
}

const iconPaths: Record<string, string> = {
  energy: `<path d="M13 2 5 14h7l-1 8 8-12h-7l1-8Z" />`,
  peak: `<path d="M4 18h16" /><path d="M6 16l4-7 4 4 4-7" />`,
  surge: `<path d="M13 2 4 14h7l-1 8 10-14h-7l1-6Z" />`,
  critical: `<rect x="7" y="4" width="10" height="16" rx="2" /><path d="M10 8h4" /><path d="M12 17h.01" />`,
  currency: `<circle cx="12" cy="12" r="8" /><path d="M12 8v8" /><path d="M9.5 10.25c.5-1.2 4.4-1.3 4.9.2.5 1.6-4.5 1.4-4.2 3.1.3 1.7 4.2 1.5 4.8.2" />`,
  solar: `<path d="M3 16h18" /><path d="M6 16l3-7h6l3 7" /><path d="M8 12h8" /><path d="M12 9v7" /><path d="M12 2v3" /><path d="M4.9 5.9l2.1 2.1" /><path d="M19.1 5.9 17 8" />`,
  battery: `<rect x="4" y="7" width="15" height="10" rx="2" /><path d="M19 10h1.5v4H19" /><path d="M8 11v2" /><path d="M11 11v2" /><path d="M14 11v2" />`,
  controller: `<rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 8h6" /><path d="M9 12h.01" /><path d="M12 12h.01" /><path d="M15 12h.01" /><path d="M9 16h6" />`,
  inverter: `<rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 10h8" /><path d="M8 14h2" /><path d="M14 14h2" /><path d="M12 5v14" />`,
  dcDist: `<path d="M12 3v18" /><path d="M5 8h14" /><path d="M5 16h14" /><circle cx="5" cy="8" r="2" /><circle cx="19" cy="8" r="2" /><circle cx="5" cy="16" r="2" /><circle cx="19" cy="16" r="2" />`,
  acDist: `<path d="M4 12h5l3-7 3 14 3-7h2" />`,
  cabling: `<path d="M7 7c-3 3-3 7 0 10s7 3 10 0" /><path d="M17 7c3 3 3 7 0 10s-7 3-10 0" /><path d="M9 9l6 6" />`,
  earthing: `<path d="M12 3v11" /><path d="M8 14h8" /><path d="M9 17h6" /><path d="M10 20h4" />`,
  monitoring: `<rect x="4" y="5" width="16" height="12" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M8 12l2 2 3-5 3 3" />`,
  settings: `<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="M4 12h2" /><path d="M18 12h2" /><path d="M12 4v2" /><path d="M12 18v2" /><path d="m6.3 6.3 1.4 1.4" /><path d="m16.3 16.3 1.4 1.4" /><path d="m17.7 6.3-1.4 1.4" /><path d="m7.7 16.3-1.4 1.4" />`,
};

function icon(name: string) {
  const paths = iconPaths[name] ?? iconPaths.settings;
  return `<span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24" role="img">${paths}</svg></span>`;
}

function input(label: string, attrs: string, value: string | number) {
  return `
    <label>
      <span>${label}</span>
      <input ${attrs} value="${attribute(value)}" />
    </label>
  `;
}

function renderProjectPanel(project: Project) {
  return `
    <section class="panel project-panel">
      <div class="section-heading">
        <span>Project</span>
        <strong>${escapeHtml(project.name)}</strong>
      </div>
      <div class="form-grid">
        ${input("Project name", 'type="text" required data-project-field="name"', project.name)}
        ${input("Country", 'type="text" required data-project-field="country"', project.country)}
        <label><span>System voltage</span><select data-project-field="systemVoltage">
          ${[12,24,48].includes(project.systemVoltage) ? "" : `<option value="${project.systemVoltage}" selected>${project.systemVoltage} V (custom; review required)</option>`}
          ${[12,24,48].map((voltage) => `<option value="${voltage}" ${project.systemVoltage === voltage ? "selected" : ""}>${voltage} V</option>`).join("")}
        </select></label>
        ${input("Sun hours", 'type="number" min="0.5" max="24" step="any" aria-describedby="sun-help" data-project-field="sunHours"', project.sunHours)}
        ${input("Autonomy days", 'type="number" min="0.5" max="30" step="0.5" data-project-field="autonomyDays"', project.autonomyDays)}
        <label>
          <span>System Option</span>
          <select data-project-field="selectedSystem">
            <option value="dc" ${selectedSystemFor(project) === "dc" ? "selected" : ""}>Fully DC</option>
            <option value="hybrid" ${selectedSystemFor(project) === "hybrid" ? "selected" : ""}>Hybrid DC + AC</option>
          </select>
        </label>
      </div>
      <p class="comparison-note" id="sun-help">Sun hours means peak-sun-equivalent hours per day, not daylight hours. Use a local low-sun-season estimate for reliable service.</p>
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
  return (loadDrafts.get(project.id) ?? project.loads)
    .map(
      (load) => `
      <tr data-load-row data-load-id="${attribute(load.id)}">
        <td>
          <div class="load-name-cell">
            <input aria-label="Load name" required data-load-id="${attribute(load.id)}" data-load-field="name" value="${attribute(load.name)}" />
          </div>
        </td>
        <td><input aria-label="Quantity" type="number" min="0" step="1" data-load-id="${attribute(load.id)}" data-load-field="quantity" value="${attribute(load.quantity)}" /></td>
        <td><input aria-label="Watts" type="number" min="0" step="any" data-load-id="${attribute(load.id)}" data-load-field="watts" value="${attribute(load.watts)}" /></td>
        <td><input aria-label="Hours per day" type="number" min="0" max="24" step="any" data-load-id="${attribute(load.id)}" data-load-field="hoursPerDay" value="${attribute(load.hoursPerDay)}" /></td>
        <td>
          <select aria-label="Current type" data-load-id="${attribute(load.id)}" data-load-field="currentType">
            <option value="DC" ${load.currentType === "DC" ? "selected" : ""}>DC</option>
            <option value="AC" ${load.currentType === "AC" ? "selected" : ""}>AC</option>
          </select>
        </td>
        <td><input aria-label="Voltage" type="number" min="1" max="1000" step="any" data-load-id="${attribute(load.id)}" data-load-field="voltage" value="${attribute(load.voltage)}" /></td>
        <td><input aria-label="Surge multiplier" type="number" min="1" max="20" step="any" data-load-id="${attribute(load.id)}" data-load-field="surgeMultiplier" value="${attribute(load.surgeMultiplier)}" /></td>
        <td>
          <label class="check-cell">
            <input type="checkbox" aria-label="Critical load: ${attribute(load.name)}" data-load-id="${attribute(load.id)}" data-load-field="critical" ${load.critical ? "checked" : ""} />
          </label>
        </td>
        <td><button class="icon-button delete-button" type="button" data-remove-load="${attribute(load.id)}" aria-label="Remove ${attribute(load.name)}">×</button></td>
      </tr>
    `,
    )
    .join("");
}

function hardwareInput(label: string, section: string, field: string, value: number, step: number | string = field.endsWith("Count") ? 1 : "any") {
  return input(label, `type="number" min="0" step="${step}" data-hardware-section="${section}" data-hardware-field="${field}"`, value);
}

function priceInput(label: string, field: keyof PricingSettings, value: number) {
  return numberField(label, `type="number" min="0" step="0.01" data-pricing-field="${field}"`, value, "USD unit price");
}

function accordionSummary(title: string, summary: string, amount = "", iconLabel = "settings") {
  return `
    <summary>
      <span class="accordion-title">
        ${icon(iconLabel)}
        <span>
          <strong>${escapeHtml(title)}</strong>
          <em>${escapeHtml(summary)}</em>
        </span>
      </span>
      ${amount ? `<span class="accordion-amount">${escapeHtml(amount)}</span>` : ""}
    </summary>
  `;
}

function renderSideControls(project: Project, plan: EquipmentPlan, evaluations: { dc: EquipmentEvaluation; hybrid: EquipmentEvaluation }, generatedPlan: EquipmentPlan, pricing: PricingSettings) {
  return `
    <section class="panel equipment-panel">
      <div class="panel-title-row">
        <div class="section-heading">
          <span>Equipment & pricing</span>
          <strong>${project.equipmentPlanMode === "custom" ? "Edited plan" : "Load-generated plan"}</strong>
        </div>
        <button type="button" data-reset-equipment>Use generated values</button>
      </div>

      <p class="comparison-note pricing-note">Generated plans select a practical regional product size for the load. Prices are editable USD allowances; entering a quote preserves it until changed.</p>
      <div class="accordion-list">
        <details>
          ${accordionSummary("Currency", `1 USD in ${project.currency}`, `${project.currency}`, "currency")}
          <div class="accordion-body mini-grid">
            <label>
              <span>Currency</span>
              <select data-project-field="currency">
                ${currencyOptions.map((currency) => `<option value="${currency}" ${project.currency === currency ? "selected" : ""}>${currency}</option>`).join("")}
              </select>
            </label>
            ${numberField("USD exchange rate", `type="number" min="0.000001" max="1000000" step="any" ${project.currency === "USD" ? "readonly" : ""} data-project-field="usdExchangeRate"`, project.usdExchangeRate, `1 USD in ${escapeHtml(project.currency)}`)}
          </div>
        </details>

        <details open>
          ${accordionSummary("Solar Panels", `${plan.shared.panelCount} panels x ${plan.shared.panelWatts} W`, `${moneyUsd(pricing.panelUnitUsd)} each`, "solar")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Panels", "shared", "panelCount", plan.shared.panelCount)}
            ${hardwareInput("Watts each", "shared", "panelWatts", plan.shared.panelWatts)}
            ${priceInput("Price per panel", "panelUnitUsd", pricing.panelUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${generatedPlan.shared.panelCount} panel(s) x ${generatedPlan.shared.panelWatts} W. Current array: ${integerFormat.format(plan.shared.panelCount * plan.shared.panelWatts)} W.</p>
        </details>

        <details>
          ${accordionSummary("Batteries", `${plan.shared.batteryCount} batteries x ${plan.shared.batteryVoltage} V ${plan.shared.batteryAh} Ah`, `${moneyUsd(pricing.batteryUnitUsd)} each`, "battery")}
          <div class="accordion-body mini-grid">
            ${productSelect("Battery reference", "batteries", plan.shared.batteryProductId, "battery")}
            ${hardwareInput("Batteries", "shared", "batteryCount", plan.shared.batteryCount)}
            ${hardwareInput("Voltage", "shared", "batteryVoltage", plan.shared.batteryVoltage)}
            ${hardwareInput("Ah each", "shared", "batteryAh", plan.shared.batteryAh)}
            ${priceInput("Price per battery", "batteryUnitUsd", pricing.batteryUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${generatedPlan.shared.batteryCount} battery/batteries x ${generatedPlan.shared.batteryVoltage} V x ${generatedPlan.shared.batteryAh} Ah. Current storage: ${formatEnergy(plan.shared.batteryCount * plan.shared.batteryVoltage * plan.shared.batteryAh)}.</p>
          <p class="comparison-note">${escapeHtml(productPriceNote("batteries", plan.shared.batteryProductId))}</p>
        </details>

        <details>
          ${accordionSummary("DC Controller", `${plan.dc.controllerCount} controller, ${plan.dc.mpptAmps} A`, `${moneyUsd(pricing.controllerUnitUsd)} each`, "controller")}
          <div class="accordion-body mini-grid">
            ${productSelect("Controller reference", "chargeControllers", plan.dc.controllerProductId, "dc")}
            ${hardwareInput("Controllers", "dc", "controllerCount", plan.dc.controllerCount)}
            ${hardwareInput("MPPT amps", "dc", "mpptAmps", plan.dc.mpptAmps)}
            ${priceInput("Price per controller", "controllerUnitUsd", pricing.controllerUnitUsd)}
          </div>
          ${renderWarnings(evaluations.dc)}
        </details>

        <details>
          ${accordionSummary("Hybrid Inverter", `${plan.hybrid.inverterCount} inverter, ${plan.hybrid.inverterWatts} W`, `${moneyUsd(pricing.inverterUnitUsd)} each`, "inverter")}
          <div class="accordion-body mini-grid">
            ${productSelect("Inverter reference", "hybridInverters", plan.hybrid.inverterProductId, "inverter")}
            ${productSelect("Separate controller reference", "chargeControllers", plan.hybrid.controllerProductId, "hybrid")}
            ${hardwareInput("Controllers", "hybrid", "controllerCount", plan.hybrid.controllerCount)}
            ${hardwareInput("MPPT amps", "hybrid", "mpptAmps", plan.hybrid.mpptAmps)}
            ${priceInput("Price per separate controller", "hybridControllerUnitUsd", pricing.hybridControllerUnitUsd ?? pricing.controllerUnitUsd)}
            ${hardwareInput("Inverters", "hybrid", "inverterCount", plan.hybrid.inverterCount)}
            ${hardwareInput("Watts each", "hybrid", "inverterWatts", plan.hybrid.inverterWatts)}
            ${priceInput("Price per inverter", "inverterUnitUsd", pricing.inverterUnitUsd)}
          </div>
          <p class="comparison-note">${escapeHtml(inverterDescription(plan))}</p>
          <p class="comparison-note">${escapeHtml(productPriceNote("hybridInverters", plan.hybrid.inverterProductId))}</p>
          ${renderWarnings(evaluations.hybrid)}
        </details>

        <details>
          ${accordionSummary("DC Distribution", `${plan.balance.dcDistributionCount} set`, moneyUsd(pricing.dcDistributionUnitUsd), "dcDist")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "dcDistributionCount", plan.balance.dcDistributionCount)}
            ${priceInput("Price per set", "dcDistributionUnitUsd", pricing.dcDistributionUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("AC Distribution", `${plan.balance.acDistributionCount} set`, moneyUsd(pricing.acDistributionUnitUsd), "acDist")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "acDistributionCount", plan.balance.acDistributionCount)}
            ${priceInput("Price per set", "acDistributionUnitUsd", pricing.acDistributionUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Cabling", `${plan.balance.cablingCount} kit`, moneyUsd(pricing.cablingUnitUsd), "cabling")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "cablingCount", plan.balance.cablingCount)}
            ${priceInput("Price per kit", "cablingUnitUsd", pricing.cablingUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Earthing", `${plan.balance.earthingCount} kit`, moneyUsd(pricing.earthingUnitUsd), "earthing")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "earthingCount", plan.balance.earthingCount)}
            ${priceInput("Price per kit", "earthingUnitUsd", pricing.earthingUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Monitoring", `${plan.balance.monitoringCount} kit`, moneyUsd(pricing.monitoringUnitUsd), "monitoring")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "monitoringCount", plan.balance.monitoringCount)}
            ${priceInput("Price per kit", "monitoringUnitUsd", pricing.monitoringUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Sizing Assumptions", "View all assumptions", "", "settings")}
          <div class="accordion-body mini-grid">
            ${numberField("Largest panel W", 'type="number" min="1" step="1" data-default-field="panelWatts"', project.equipmentDefaults.panelWatts)}
            ${numberField("Preferred battery V", 'type="number" min="1" step="any" data-default-field="batteryVoltage"', project.equipmentDefaults.batteryVoltage)}
            ${numberField("Preferred battery Ah", 'type="number" min="1" step="1" data-default-field="batteryAh"', project.equipmentDefaults.batteryAh)}
            ${numberField("Preferred controller A", 'type="number" min="1" step="1" data-default-field="mpptAmpStep"', project.equipmentDefaults.mpptAmpStep)}
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
              .map(([field, label]) => {
                const factorFields = new Set(["batteryReserveFactor", "mpptSafetyFactor", "inverterHeadroomFactor"]);
                const rateFields = new Set(["installationRate", "contingencyRate"]);
                const min = factorFields.has(field) ? 1 : rateFields.has(field) ? 0 : 0.01;
                const max = factorFields.has(field) ? 3 : 1;
                return numberField(label, `type="number" min="${min}" max="${max}" step="0.01" data-assumption-field="${field}"`, state.assumptions[field as keyof Assumptions] as number);
              })
              .join("")}
          </div>
        </details>
      </div>
    </section>
  `;
}

function renderWarnings(evaluation: EquipmentEvaluation) {
  if (evaluation.warnings.length === 0) {
    return `<p class="pass-note">The current equipment meets the preliminary capacity checks. Electrical compatibility and installation design still require qualified review.</p>`;
  }

  return `
    <ul class="warning-list">
      ${evaluation.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
    </ul>
  `;
}

function renderPlanner(project: Project) {
  const { result, generatedPlan, plan, evaluations, costs, recommendations, pricing } = getProjectBundle(project, state.assumptions);
  const [dcCost, hybridCost] = costs;
  const selectedSystem = selectedSystemFor(project);

  return `
    <main class="planner-grid" id="planner" tabindex="-1">
      <div class="side-column">
        ${renderProjectPanel(project)}
        ${renderSideControls(project, plan, evaluations, generatedPlan, pricing)}
      </div>

      <div class="main-column">
        <section class="panel metrics-panel">
          <div class="metric">${icon("energy")}<span>Total daily energy</span><strong>${formatEnergy(result.totalDailyWh)}</strong><em>${decimalFormat.format(result.totalDailyWh)} Wh</em></div>
          <div class="metric">${icon("peak")}<span>Peak load</span><strong>${decimalFormat.format(result.peakLoadW)} W</strong></div>
          <div class="metric">${icon("surge")}<span>Surge load</span><strong>${decimalFormat.format(result.surgeLoadW)} W</strong></div>
          <div class="metric">${icon("critical")}<span>Critical load energy</span><strong>${formatEnergy(result.criticalDailyWh)}</strong><em>${decimalFormat.format(result.criticalDailyWh)} Wh</em></div>
        </section>

        <section class="panel loads-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Loads</span>
              <strong>${(loadDrafts.get(project.id) ?? project.loads).length} device groups</strong>
            </div>
            <div class="load-actions">
              <button type="button" data-calculate-loads>Calculate</button>
              <button type="button" data-add-load>Add load</button>
            </div>
          </div>
          <div class="validation-summary" data-validation-summary role="alert" tabindex="-1" hidden></div>
          <p class="comparison-note" data-load-status role="status" aria-live="polite"></p>
          <div class="table-wrap" tabindex="0" role="region" aria-label="Load table, scroll horizontally for more columns">
            <table class="editable-table">
              <caption class="sr-only">Electrical loads. Watts and hours are per device; zero quantity or hours excludes a row from sizing.</caption>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Watts (W)</th>
                  <th>Hours / Day</th>
                  <th>Type</th>
                  <th>Voltage (V)</th>
                  <th>Surge (x)</th>
                  <th>Critical</th>
                  <th><span class="sr-only">Actions</span></th>
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
                      <div><dt>MPPT requirement</dt><dd>${evaluation.checks.find((check) => check.label === "MPPT/controller")!.required} A</dd></div>
                      ${option.id === "hybrid" ? `<div><dt>Inverter requirement</dt><dd>${integerFormat.format(sizing.recommendedInverterW)} W</dd></div>` : ""}
                      <div><dt>Total planning estimate</dt><dd>${money(estimate.total, project)}</dd></div>
                    </dl>
                    ${renderWarnings(evaluation)}
                    <details class="planning-notes"><summary>Planning notes</summary><ul>${evaluation.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul></details>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      </div>
    </main>

    <section class="panel report-panel ${reportVisible ? "report-panel-ready" : "report-panel-gate"}">
      <p data-report-pending role="status" hidden>Load changes pending. Calculate before generating or exporting the report.</p>
      <div data-report-content>
      ${
        reportVisible
          ? `
        <div class="report-body">
          <div class="panel-title-row report-toolbar">
            <div class="section-heading">
              <span>Report generation</span>
              <strong>${systemOptionName(selectedSystem)} report</strong>
            </div>
            <div class="report-actions">
              <button type="button" data-print>Print / Save PDF</button>
              <a class="button-link" href="#" data-export-csv>Export CSV</a>
            </div>
          </div>
          <div id="report" tabindex="-1" aria-label="${attribute(systemOptionName(selectedSystem))} report">${renderProjectReport(project, state.assumptions, brands)}</div>
        </div>
      `
          : `
        <div class="report-gate-content">
          <div class="section-heading">
            <span>Report generation</span>
            <strong>Generate the selected system report</strong>
            <em>Creates the ${systemOptionName(selectedSystem)} report section below the planner when you are ready to review, print, or export.</em>
          </div>
          <button type="button" data-generate-report>Generate Report</button>
        </div>
      `
      }
      </div>
    </section>
  `;
}

function render() {
  if (!app) return;

  if (csvObjectUrl) {
    URL.revokeObjectURL(csvObjectUrl);
    csvObjectUrl = "";
  }

  const project = activeProject();
  const brand = brands.find((item) => item.id === project.brandProfileId) ?? brands[0];

  app.innerHTML = `
    <div class="app-shell">
      <a class="skip-link" href="#planner">Skip to planner</a>
      <header class="topbar">
        <div class="brand-lockup">
          <div class="brand-mark" aria-hidden="true">
            <img src="${solarPlannerLogoUrl}" alt="" />
          </div>
          <div>
          <h1>Hello Solar Planner</h1>
          </div>
        </div>
        <div class="top-actions">
          <select data-project-switch aria-label="Switch project">
            ${state.projects.map((item) => `<option value="${attribute(item.id)}" ${item.id === project.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
          </select>
          <button type="button" data-new-project>New Project</button>
          <button type="button" data-load-sample>Sample</button>
        </div>
      </header>
      <div class="persistence-notice" data-persistence-notice role="status" ${persistenceNotice ? "" : "hidden"}>${escapeHtml(persistenceNotice)}</div>
      ${renderPlanner(project)}
    </div>
  `;

  bindEvents();
  updatePendingState();
}

// Keep form nodes alive on committed sidebar edits, including keyboard focus.
function refreshResults() {
  const project = activeProject();
  const template = document.createElement("template");
  template.innerHTML = renderPlanner(project);
  for (const selector of [".metrics-panel", ".recommendations-panel", ".report-panel"]) {
    document.querySelector(selector)?.replaceWith(template.content.querySelector(selector)!);
  }
  const freshEquipment = template.content.querySelector(".equipment-panel")!;
  document.querySelectorAll(".equipment-panel summary").forEach((summary, index) => {
    summary.innerHTML = freshEquipment.querySelectorAll("summary")[index].innerHTML;
  });
  document.querySelectorAll(".equipment-panel details .comparison-note, .equipment-panel .warning-list, .equipment-panel .pass-note").forEach((node) => node.remove());
  document.querySelectorAll(".equipment-panel details").forEach((detail, index) => {
    freshEquipment.querySelectorAll("details")[index].querySelectorAll(".comparison-note, .warning-list, .pass-note").forEach((note) => detail.append(note.cloneNode(true)));
  });
  document.querySelectorAll<HTMLInputElement>("[data-hardware-field]").forEach((field) => {
    const fresh = freshEquipment.querySelector<HTMLInputElement>(`[data-hardware-section="${field.dataset.hardwareSection}"][data-hardware-field="${field.dataset.hardwareField}"]`);
    if (fresh && !field.hasAttribute("data-pending")) field.value = fresh.value;
  });
  document.querySelectorAll<HTMLInputElement>("[data-pricing-field]").forEach((field) => {
    const fresh = freshEquipment.querySelector<HTMLInputElement>(`[data-pricing-field="${field.dataset.pricingField}"]`);
    if (fresh && !field.hasAttribute("data-pending")) field.value = fresh.value;
  });
  document.querySelectorAll<HTMLSelectElement>("[data-product-target]").forEach((field) => {
    const fresh = freshEquipment.querySelector<HTMLSelectElement>(`[data-product-target="${field.dataset.productTarget}"]`);
    if (fresh) field.innerHTML = fresh.innerHTML;
  });
  document.querySelector(".equipment-panel .section-heading strong")!.textContent = project.equipmentPlanMode === "custom" ? "Edited plan" : "Load-generated plan";
  document.querySelector(".project-panel .section-heading strong")!.textContent = project.name;
  const switcher = document.querySelector<HTMLSelectElement>("[data-project-switch]")!;
  switcher.selectedOptions[0].textContent = project.name;
  const rate = document.querySelector<HTMLInputElement>('[data-project-field="usdExchangeRate"]')!;
  if (!rate.hasAttribute("data-pending") || project.currency === "USD") {
    rate.value = String(project.usdExchangeRate);
    rate.removeAttribute("data-pending");
    rate.removeAttribute("aria-invalid");
    rate.setCustomValidity("");
  }
  rate.readOnly = project.currency === "USD";
  rate.parentElement!.querySelector("em")!.textContent = `1 USD in ${project.currency}`;
  bindReportEvents();
  labelStructure();
  updatePendingState();
}

function labelStructure() {
  document.querySelectorAll("th").forEach((cell) => cell.setAttribute("scope", "col"));
  document.querySelectorAll(".section-heading > span").forEach((heading) => { heading.setAttribute("role", "heading"); heading.setAttribute("aria-level", "2"); });
  document.querySelectorAll<HTMLTableElement>(".report-table").forEach((table) => {
    const label = table.closest("section")?.querySelector("h2")?.textContent ?? "Report table";
    table.setAttribute("aria-label", label);
    if (!table.parentElement?.classList.contains("report-table-scroll")) {
      const scrollRegion = document.createElement("div");
      scrollRegion.className = "report-table-scroll";
      scrollRegion.tabIndex = 0;
      scrollRegion.setAttribute("role", "region");
      scrollRegion.setAttribute("aria-label", `${label}, scroll horizontally for more columns`);
      table.before(scrollRegion);
      scrollRegion.append(table);
    }
  });
}

function collectLoadTable(project: Project): Project["loads"] {
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>("[data-load-row]"));
  if (rows.length === 0) return loadDrafts.get(project.id) ?? project.loads;

  const readField = (row: HTMLTableRowElement, field: string) =>
    row.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-load-field="${field}"]`);
  const readNumber = (row: HTMLTableRowElement, field: string, fallback: number) => {
    return (readField(row, field) as HTMLInputElement | null)?.valueAsNumber ?? fallback;
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

function showValidationIssues(issues: ValidationIssue[]) {
  const summary = document.querySelector<HTMLElement>("[data-validation-summary]");
  if (!summary) return;

  if (issues.length === 0) {
    summary.hidden = true;
    summary.innerHTML = "";
    return;
  }

  document.querySelectorAll("[data-load-field]").forEach((field) => field.removeAttribute("aria-invalid"));
  summary.innerHTML = `<strong>Check these values before calculating:</strong><ul>${issues.map((issue, index) => {
    const [, row, field] = issue.path.split(".");
    const control = document.querySelectorAll("[data-load-row]")[Number(row)]?.querySelector(`[data-load-field="${field}"]`);
    control?.setAttribute("aria-invalid", "true");
    control?.setAttribute("aria-describedby", `validation-${index}`);
    return `<li id="validation-${index}">${escapeHtml(issue.message)}</li>`;
  }).join("")}</ul>`;
  summary.hidden = false;
  summary.focus();
}

function controlIsValid(target: HTMLInputElement | HTMLSelectElement): boolean {
  target.setCustomValidity("");
  if (target.checkValidity()) {
    target.removeAttribute("aria-invalid");
    target.removeAttribute("data-pending");
    return true;
  }
  target.setAttribute("aria-invalid", "true");
  target.reportValidity();
  return false;
}

function bindEvents() {
  labelStructure();
  document.querySelectorAll<HTMLInputElement>('[type="number"]').forEach((field) => { field.required = true; if (!field.max) field.max = "1000000"; });
  document.querySelectorAll<HTMLInputElement>("[data-project-field], [data-hardware-field], [data-default-field], [data-pricing-field], [data-assumption-field]").forEach((field) => {
    field.addEventListener("input", () => {
      field.setCustomValidity("");
      field.setAttribute("data-pending", "true");
      updatePendingState();
    });
    // Returning to the original value may not emit change, but still finishes an edit.
    field.addEventListener("blur", () => {
      if (field.hasAttribute("data-pending")) field.dispatchEvent(new Event("change"));
    });
  });
  document.querySelectorAll<HTMLElement>("[data-load-row]").forEach((row, index) => {
    row.querySelectorAll<HTMLElement>("[data-load-field]").forEach((field) => {
      field.setAttribute("aria-label", `${field.getAttribute("aria-label") ?? field.dataset.loadField}, row ${index + 1}`);
      const stage = () => {
        loadDrafts.set(activeProject().id, collectLoadTable(activeProject()));
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
        updatePendingState();
      };
      field.addEventListener("input", stage);
      field.addEventListener("change", stage);
    });
  });
  document.querySelector("[data-project-switch]")?.addEventListener("change", (event) => {
    reportVisible = false;
    state.activeProjectId = (event.target as HTMLSelectElement).value;
    saveState();
    render();
  });

  document.querySelectorAll("[data-project-field]").forEach((inputElement) => {
    const numericFields = new Set<keyof Project>(["systemVoltage", "sunHours", "autonomyDays", "usdExchangeRate"]);
    const updateProjectField = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (!controlIsValid(target)) return;
      const project = clone(activeProject());
      const field = target.dataset.projectField as keyof Project;
      (project[field] as string | number) = numericFields.has(field) ? Number(target.value) : target.value;
      const issue = validateProject(project).find((item) => item.path === field);
      if (issue) { target.setAttribute("data-pending", "true"); target.setAttribute("aria-invalid", "true"); target.setCustomValidity(issue.message); target.reportValidity(); return; }
      setActiveProject(project, true);
    };

    inputElement.addEventListener("change", updateProjectField);
  });

  document.querySelector("[data-calculate-loads]")?.addEventListener("click", () => {
    const pending = document.querySelector<HTMLInputElement>("[data-pending]");
    if (pending) { pending.focus(); pending.reportValidity(); return; }
    const project = clone(activeProject());
    project.loads = collectLoadTable(project);
    const issues = [...validateProject(project), ...validateAssumptions(state.assumptions)];
    if (issues.length > 0) {
      showValidationIssues(issues);
      return;
    }
    showValidationIssues([]);
    loadDrafts.delete(project.id);
    const uiState = captureEquipmentUiState();
    setActiveProject(project);
    restoreEquipmentUiState(uiState);
    document.querySelector<HTMLElement>("[data-calculate-loads]")?.focus({ preventScroll: true });
  });

  document.querySelectorAll("[data-remove-load]").forEach((button) => {
    button.addEventListener("click", () => {
      const pending = document.querySelector<HTMLInputElement>("[data-pending]");
      if (pending) { pending.focus(); pending.reportValidity(); return; }
      const project = clone(activeProject());
      loadDrafts.set(project.id, collectLoadTable(project).filter((load) => load.id !== (button as HTMLButtonElement).dataset.removeLoad));
      const uiState = captureEquipmentUiState();
      render();
      restoreEquipmentUiState(uiState);
      document.querySelector<HTMLElement>("[data-add-load]")?.focus({ preventScroll: true });
    });
  });

  document.querySelector("[data-add-load]")?.addEventListener("click", () => {
    const pending = document.querySelector<HTMLInputElement>("[data-pending]");
    if (pending) { pending.focus(); pending.reportValidity(); return; }
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
    loadDrafts.set(project.id, project.loads);
    const uiState = captureEquipmentUiState();
    render();
    restoreEquipmentUiState(uiState);
    const names = document.querySelectorAll<HTMLInputElement>('[data-load-field="name"]');
    names[names.length - 1]?.focus();
  });

  document.querySelectorAll("[data-hardware-field]").forEach((inputElement) => {
    const updateHardware = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!controlIsValid(target)) return;
      const project = clone(activeProject());
      project.pricing = { ...getProjectBundle(project, state.assumptions).pricing };
      const generatedPlan = generateEquipmentPlan(calculateProject(project, state.assumptions), project.equipmentDefaults, project, state.assumptions);
      const plan = clone(currentPlan(project, generatedPlan));
      const section = target.dataset.hardwareSection as keyof EquipmentPlan;
      const field = target.dataset.hardwareField ?? "";
      (plan[section] as unknown as Record<string, number>)[field] = Number(target.value);
      if (section === "shared" && ["batteryVoltage", "batteryAh"].includes(field)) plan.shared.batteryProductId = undefined;
      if (section === "shared" && field === "panelWatts") plan.shared.panelProductId = undefined;
      if ((section === "dc" || section === "hybrid") && field === "mpptAmps") plan[section].controllerProductId = undefined;
      if (section === "hybrid" && field === "inverterWatts") plan.hybrid.inverterProductId = undefined;
      const issue = validateEquipmentPlan(plan).find((item) => item.path === `${section}.${field}`);
      if (issue) {
        target.setCustomValidity(issue.message);
        target.reportValidity();
        return;
      }
      project.equipmentPlan = plan;
      project.equipmentPlanMode = "custom";
      setActiveProject(project, true);
    };

    inputElement.addEventListener("change", updateHardware);
  });

  document.querySelectorAll<HTMLSelectElement>("[data-product-target]").forEach((select) => {
    select.addEventListener("change", () => {
      const project = clone(activeProject());
      const bundle = getProjectBundle(project, state.assumptions);
      const plan = clone(bundle.plan);
      project.pricing = { ...bundle.pricing };
      const item = catalog[select.dataset.productCategory as keyof ProductCatalog].find((product) => product.id === select.value);
      const target = select.dataset.productTarget;
      if (target === "battery") {
        plan.shared.batteryProductId = item?.id;
        if (item) { plan.shared.batteryVoltage = item.voltage!; plan.shared.batteryAh = item.ampHours!; project.pricing.batteryUnitUsd = item.unitCost; }
      } else if (target === "inverter") {
        plan.hybrid.inverterProductId = item?.id;
        if (item) {
          plan.hybrid.inverterWatts = item.watts!;
          project.pricing.inverterUnitUsd = item.unitCost;
          if (item.systemVoltage === project.systemVoltage && plan.hybrid.inverterCount === 1) {
            const controller = catalog.chargeControllers.find((candidate) => candidate.id === plan.hybrid.controllerProductId && candidate.amps === plan.hybrid.mpptAmps);
            const arrayW = plan.shared.panelCount * plan.shared.panelWatts;
            const requiredA = Math.max(bundle.result.hybrid.recommendedMpptCurrentA, requiredControllerAmps(arrayW, project, state.assumptions));
            plan.hybrid.controllerCount = supplementaryControllers(item, controller, project.systemVoltage, arrayW, requiredA) ?? plan.hybrid.controllerCount;
          }
        }
      } else if (target === "dc" || target === "hybrid") {
        plan[target].controllerProductId = item?.id;
        if (item) {
          plan[target].mpptAmps = item.amps!;
          if (target === "dc") project.pricing.controllerUnitUsd = item.unitCost;
          else project.pricing.hybridControllerUnitUsd = item.unitCost;
        }
      }
      project.equipmentPlan = plan;
      project.equipmentPlanMode = "custom";
      setActiveProject(project, true);
    });
  });

  document.querySelector("[data-reset-equipment]")?.addEventListener("click", () => {
    document.querySelectorAll<HTMLInputElement>("[data-hardware-field]").forEach((field) => { field.removeAttribute("data-pending"); field.removeAttribute("aria-invalid"); field.setCustomValidity(""); });
    const project = clone(activeProject());
    project.equipmentPlan = undefined;
    project.equipmentPlanMode = "generated";
    setActiveProject(project, true);
  });

  document.querySelectorAll("[data-default-field]").forEach((inputElement) => {
    inputElement.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (!controlIsValid(target)) return;
      const project = clone(activeProject());
      const field = target.dataset.defaultField as keyof EquipmentDefaults;
      project.equipmentDefaults[field] = Number(target.value);
      setActiveProject(project, true);
    });
  });

  document.querySelectorAll("[data-pricing-field]").forEach((inputElement) => {
    const updatePricing = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!controlIsValid(target)) return;
      const project = clone(activeProject());
      project.pricing = { ...getProjectBundle(project, state.assumptions).pricing };
      const field = target.dataset.pricingField as keyof PricingSettings;
      project.pricing[field] = Number(target.value);
      project.equipmentPlan = currentPlan(project, generateEquipmentPlan(calculateProject(project, state.assumptions), project.equipmentDefaults, project, state.assumptions));
      project.equipmentPlanMode = "custom";
      setActiveProject(project, true);
    };

    inputElement.addEventListener("change", updatePricing);
  });

  document.querySelectorAll("[data-assumption-field]").forEach((inputElement) => {
    inputElement.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (!controlIsValid(target)) return;
      const field = target.dataset.assumptionField as keyof Assumptions;
      const assumptions = { ...state.assumptions, [field]: Number(target.value) };
      const issue = validateAssumptions(assumptions).find((item) => item.path === field);
      if (issue) {
        target.setCustomValidity(issue.message);
        target.reportValidity();
        return;
      }
      state.assumptions = assumptions;
      saveState();
      refreshResults();
    });
  });

  document.querySelector("[data-new-project]")?.addEventListener("click", () => {
    reportVisible = false;
    const project = normalizeProject(clone(sampleProjectData) as Project);
    project.id = uid();
    project.name = "Untitled solar project";
    project.loads = [];
    project.updatedAt = new Date().toISOString();
    state.projects = [...state.projects, project];
    state.activeProjectId = project.id;
    saveState();
    render();
  });

  document.querySelector("[data-load-sample]")?.addEventListener("click", () => {
    reportVisible = false;
    const sample = normalizeProject(clone(sampleProjectData) as Project);
    sample.id = uid();
    sample.updatedAt = new Date().toISOString();
    state.projects = [...state.projects, sample];
    state.activeProjectId = sample.id;
    saveState();
    render();
  });

  bindReportEvents();
}

function bindReportEvents() {
  document.querySelector("[data-generate-report]")?.addEventListener("click", () => {
    if (hasPendingInputs()) return;
    reportVisible = true;
    refreshResults();
    document.querySelector<HTMLElement>("#report")?.focus({ preventScroll: true });
    document.querySelector(".report-panel-ready")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!hasPendingInputs()) window.print();
    });
  });

  const exportLink = document.querySelector<HTMLAnchorElement>("[data-export-csv]");
  if (exportLink) {
    if (csvObjectUrl) URL.revokeObjectURL(csvObjectUrl);
    const project = activeProject();
    csvObjectUrl = createCsvObjectUrl(buildProjectCsv(project, state.assumptions, brands));
    exportLink.href = csvObjectUrl;
    exportLink.download = projectCsvFilename(project);
    exportLink.addEventListener("click", (event) => { if (hasPendingInputs()) event.preventDefault(); });
  }

}

render();
