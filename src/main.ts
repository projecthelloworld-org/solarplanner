import "./styles.css";
import solarPlannerLogoUrl from "./assets/solar_planner_logo.svg";
import brandProfilesData from "./data/brand-profiles.json";
import sampleProjectData from "./data/sample-project.json";
import { loadAppState, normalizeProject, saveAppState } from "./app/persistence";
import { calculateProject } from "./engine/calculations";
import { generateEquipmentPlan } from "./engine/equipment";
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
} from "./types/project";
import { attribute, clone, escapeHtml, uid } from "./utils/html";
import { formatEnergy, integerFormat, money, moneyUsd, selectedSystemFor, systemOptionName } from "./utils/format";

const app = document.querySelector<HTMLDivElement>("#app");
const brands = brandProfilesData as BrandProfile[];
const currencyOptions = ["USD", "UGX", "KES", "TZS", "RWF", "BIF", "ZMW", "MWK", "ETB", "GHS", "NGN", "EUR", "GBP"];
const loaded = loadAppState(localStorage);
let state = loaded.state;
let persistenceNotice = loaded.notice;
let reportVisible = false;
let csvObjectUrl = "";

function saveState() {
  persistenceNotice = saveAppState(state, localStorage);
}

function activeProject(): Project {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
}

interface EquipmentUiState {
  openDetails: number[];
  scrollPosition: number;
}

function captureEquipmentUiState(): EquipmentUiState {
  const openDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>(".equipment-panel details")).reduce<number[]>((open, detail, index) => {
    if (detail.open) open.push(index);
    return open;
  }, []);

  return { openDetails, scrollPosition: window.scrollY };
}

function restoreEquipmentUiState(uiState: EquipmentUiState) {
  const details = document.querySelectorAll<HTMLDetailsElement>(".equipment-panel details");
  uiState.openDetails.forEach((index) => {
    const detail = details[index];
    if (detail) detail.open = true;
  });
  window.scrollTo({ top: uiState.scrollPosition, behavior: "instant" });
}

function setActiveProject(project: Project, preserveEquipmentUi = false) {
  const equipmentUiState = preserveEquipmentUi ? captureEquipmentUiState() : undefined;

  project.updatedAt = new Date().toISOString();
  state.projects = state.projects.map((item) => (item.id === project.id ? normalizeProject(project) : item));
  saveState();
  render();

  if (equipmentUiState) restoreEquipmentUiState(equipmentUiState);
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
        ${input("Project name", 'type="text" data-project-field="name"', project.name)}
        ${input("Country", 'type="text" data-project-field="country"', project.country)}
        ${input("System voltage", 'type="number" min="12" max="100" step="1" data-project-field="systemVoltage"', project.systemVoltage)}
        ${input("Sun hours", 'type="number" min="0.5" max="24" step="0.1" data-project-field="sunHours"', project.sunHours)}
        ${input("Autonomy days", 'type="number" min="0.5" max="30" step="0.5" data-project-field="autonomyDays"', project.autonomyDays)}
        <label>
          <span>System Option</span>
          <select data-project-field="selectedSystem">
            <option value="dc" ${selectedSystemFor(project) === "dc" ? "selected" : ""}>Fully DC</option>
            <option value="hybrid" ${selectedSystemFor(project) === "hybrid" ? "selected" : ""}>Hybrid DC + AC</option>
          </select>
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
      <tr data-load-row data-load-id="${attribute(load.id)}">
        <td>
          <div class="load-name-cell">
            <input aria-label="Load name" data-load-id="${attribute(load.id)}" data-load-field="name" value="${attribute(load.name)}" />
          </div>
        </td>
        <td><input aria-label="Quantity" type="number" min="0" step="1" data-load-id="${attribute(load.id)}" data-load-field="quantity" value="${attribute(load.quantity)}" /></td>
        <td><input aria-label="Watts" type="number" min="0" step="1" data-load-id="${attribute(load.id)}" data-load-field="watts" value="${attribute(load.watts)}" /></td>
        <td><input aria-label="Hours per day" type="number" min="0" max="24" step="0.25" data-load-id="${attribute(load.id)}" data-load-field="hoursPerDay" value="${attribute(load.hoursPerDay)}" /></td>
        <td>
          <select aria-label="Current type" data-load-id="${attribute(load.id)}" data-load-field="currentType">
            <option value="DC" ${load.currentType === "DC" ? "selected" : ""}>DC</option>
            <option value="AC" ${load.currentType === "AC" ? "selected" : ""}>AC</option>
          </select>
        </td>
        <td><input aria-label="Voltage" type="number" min="0" step="1" data-load-id="${attribute(load.id)}" data-load-field="voltage" value="${attribute(load.voltage)}" /></td>
        <td><input aria-label="Surge multiplier" type="number" min="1" step="0.1" data-load-id="${attribute(load.id)}" data-load-field="surgeMultiplier" value="${attribute(load.surgeMultiplier)}" /></td>
        <td>
          <label class="check-cell">
            <input type="checkbox" data-load-id="${attribute(load.id)}" data-load-field="critical" ${load.critical ? "checked" : ""} />
          </label>
        </td>
        <td><button class="icon-button delete-button" type="button" data-remove-load="${attribute(load.id)}" aria-label="Remove ${attribute(load.name)}">×</button></td>
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

function accordionSummary(title: string, summary: string, amount = "", iconLabel = "settings") {
  return `
    <summary>
      <span class="accordion-title">
        ${icon(iconLabel)}
        <span>
          <strong>${title}</strong>
          <em>${summary}</em>
        </span>
      </span>
      ${amount ? `<span class="accordion-amount">${amount}</span>` : ""}
    </summary>
  `;
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
          ${accordionSummary("Currency", `1 USD in ${project.currency}`, `${project.currency}`, "currency")}
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
          ${accordionSummary("Solar Panels", `${plan.shared.panelCount} panels x ${plan.shared.panelWatts} W`, moneyUsd(project.pricing.panelUnitUsd), "solar")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Panels", "shared", "panelCount", plan.shared.panelCount)}
            ${hardwareInput("Watts each", "shared", "panelWatts", plan.shared.panelWatts)}
            ${priceInput("Price per panel", "panelUnitUsd", project.pricing.panelUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${generatedPlan.shared.panelCount} panel(s) x ${generatedPlan.shared.panelWatts} W. Current array: ${integerFormat.format(plan.shared.panelCount * plan.shared.panelWatts)} W.</p>
        </details>

        <details>
          ${accordionSummary("Batteries", `${plan.shared.batteryCount} batteries x ${plan.shared.batteryVoltage} V ${plan.shared.batteryAh} Ah`, moneyUsd(project.pricing.batteryUnitUsd), "battery")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Batteries", "shared", "batteryCount", plan.shared.batteryCount)}
            ${hardwareInput("Voltage", "shared", "batteryVoltage", plan.shared.batteryVoltage)}
            ${hardwareInput("Ah each", "shared", "batteryAh", plan.shared.batteryAh)}
            ${priceInput("Price per battery", "batteryUnitUsd", project.pricing.batteryUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${generatedPlan.shared.batteryCount} battery/batteries x ${generatedPlan.shared.batteryVoltage} V x ${generatedPlan.shared.batteryAh} Ah. Current storage: ${formatEnergy(plan.shared.batteryCount * plan.shared.batteryVoltage * plan.shared.batteryAh)}.</p>
        </details>

        <details>
          ${accordionSummary("DC Controller", `${plan.dc.controllerCount} controller, ${plan.dc.mpptAmps} A`, moneyUsd(project.pricing.controllerUnitUsd), "controller")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Controllers", "dc", "controllerCount", plan.dc.controllerCount)}
            ${hardwareInput("MPPT amps", "dc", "mpptAmps", plan.dc.mpptAmps)}
            ${priceInput("Price per controller", "controllerUnitUsd", project.pricing.controllerUnitUsd)}
          </div>
          ${renderWarnings(evaluations.dc)}
        </details>

        <details>
          ${accordionSummary("Hybrid Inverter", `${plan.hybrid.inverterCount} inverter, ${plan.hybrid.inverterWatts} W`, moneyUsd(project.pricing.inverterUnitUsd), "inverter")}
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
          ${accordionSummary("DC Distribution", `${plan.balance.dcDistributionCount} set`, moneyUsd(project.pricing.dcDistributionUnitUsd), "dcDist")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "dcDistributionCount", plan.balance.dcDistributionCount)}
            ${priceInput("Price per set", "dcDistributionUnitUsd", project.pricing.dcDistributionUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("AC Distribution", `${plan.balance.acDistributionCount} set`, moneyUsd(project.pricing.acDistributionUnitUsd), "acDist")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "acDistributionCount", plan.balance.acDistributionCount)}
            ${priceInput("Price per set", "acDistributionUnitUsd", project.pricing.acDistributionUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Cabling", `${plan.balance.cablingCount} kit`, moneyUsd(project.pricing.cablingUnitUsd), "cabling")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "cablingCount", plan.balance.cablingCount)}
            ${priceInput("Price per kit", "cablingUnitUsd", project.pricing.cablingUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Earthing", `${plan.balance.earthingCount} kit`, moneyUsd(project.pricing.earthingUnitUsd), "earthing")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "earthingCount", plan.balance.earthingCount)}
            ${priceInput("Price per kit", "earthingUnitUsd", project.pricing.earthingUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Monitoring", `${plan.balance.monitoringCount} kit`, moneyUsd(project.pricing.monitoringUnitUsd), "monitoring")}
          <div class="accordion-body mini-grid">
            ${hardwareInput("Quantity", "balance", "monitoringCount", plan.balance.monitoringCount)}
            ${priceInput("Price per kit", "monitoringUnitUsd", project.pricing.monitoringUnitUsd)}
          </div>
        </details>

        <details>
          ${accordionSummary("Sizing Assumptions", "View all assumptions", "", "settings")}
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
      ${evaluation.warnings.map((warning) => `<li>${warning}</li>`).join("")}
    </ul>
  `;
}

function renderPlanner(project: Project) {
  const { result, generatedPlan, plan, evaluations, costs, recommendations } = getProjectBundle(project, state.assumptions);
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
          <div class="metric">${icon("energy")}<span>Total daily energy</span><strong>${formatEnergy(result.totalDailyWh)}</strong><em>${integerFormat.format(result.totalDailyWh)} Wh</em></div>
          <div class="metric">${icon("peak")}<span>Peak load</span><strong>${integerFormat.format(result.peakLoadW)} W</strong></div>
          <div class="metric">${icon("surge")}<span>Surge load</span><strong>${integerFormat.format(result.surgeLoadW)} W</strong></div>
          <div class="metric">${icon("critical")}<span>Critical load energy</span><strong>${formatEnergy(result.criticalDailyWh)}</strong><em>${integerFormat.format(result.criticalDailyWh)} Wh</em></div>
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
          <div class="validation-summary" data-validation-summary role="alert" tabindex="-1" hidden></div>
          <div class="table-wrap">
            <table class="editable-table">
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

    <section class="panel report-panel ${reportVisible ? "report-panel-ready" : "report-panel-gate"}">
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
          <div id="report">${renderProjectReport(project, state.assumptions, brands)}</div>
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
      ${persistenceNotice ? `<div class="persistence-notice" role="status">${escapeHtml(persistenceNotice)}</div>` : ""}
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

function showValidationIssues(issues: ValidationIssue[]) {
  const summary = document.querySelector<HTMLElement>("[data-validation-summary]");
  if (!summary) return;

  if (issues.length === 0) {
    summary.hidden = true;
    summary.innerHTML = "";
    return;
  }

  summary.innerHTML = `<strong>Check the load table before calculating:</strong><ul>${issues.map((issue) => `<li>${escapeHtml(issue.message)}</li>`).join("")}</ul>`;
  summary.hidden = false;
  summary.focus();
}

function controlIsValid(target: HTMLInputElement | HTMLSelectElement): boolean {
  target.setCustomValidity("");
  if (target.checkValidity()) return true;
  target.reportValidity();
  return false;
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
      if (!controlIsValid(target)) return;
      const project = clone(activeProject());
      const field = target.dataset.projectField as keyof Project;
      (project[field] as string | number) = numericFields.has(field) ? Number(target.value) : target.value;
      setActiveProject(project, Boolean(target.closest(".equipment-panel")));
    };

    inputElement.addEventListener("change", updateProjectField);
  });

  document.querySelector("[data-calculate-loads]")?.addEventListener("click", () => {
    const project = clone(activeProject());
    project.loads = collectLoadTable(project);
    const issues = [...validateProject(project), ...validateAssumptions(state.assumptions)];
    if (issues.length > 0) {
      showValidationIssues(issues);
      return;
    }
    showValidationIssues([]);
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
      if (!controlIsValid(target)) return;
      const project = clone(activeProject());
      const generatedPlan = generateEquipmentPlan(calculateProject(project, state.assumptions), project.equipmentDefaults);
      const plan = clone(currentPlan(project, generatedPlan));
      const section = target.dataset.hardwareSection as keyof EquipmentPlan;
      const field = target.dataset.hardwareField ?? "";
      (plan[section] as unknown as Record<string, number>)[field] = Number(target.value);
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

  document.querySelector("[data-reset-equipment]")?.addEventListener("click", () => {
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
      const field = target.dataset.pricingField as keyof PricingSettings;
      project.pricing[field] = Number(target.value);
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
      const equipmentUiState = captureEquipmentUiState();
      saveState();
      render();
      restoreEquipmentUiState(equipmentUiState);
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

  document.querySelector("[data-generate-report]")?.addEventListener("click", () => {
    reportVisible = true;
    render();
    document.querySelector(".report-panel-ready")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => {
      window.print();
    });
  });

  const exportLink = document.querySelector<HTMLAnchorElement>("[data-export-csv]");
  if (exportLink) {
    const project = activeProject();
    csvObjectUrl = createCsvObjectUrl(buildProjectCsv(project, state.assumptions, brands));
    exportLink.href = csvObjectUrl;
    exportLink.download = projectCsvFilename(project);
  }

}

render();
