import { Eta } from "eta";
import "./styles.css";
import assumptionsData from "./data/assumptions.json";
import brandProfilesData from "./data/brand-profiles.json";
import productsData from "./data/default-products.json";
import sampleProjectData from "./data/sample-project.json";
import { calculateProject } from "./engine/calculations";
import { estimateCosts } from "./engine/costing";
import { buildRecommendations } from "./engine/recommendations";
import reportTemplate from "./templates/report.eta?raw";
import type { Assumptions, BrandProfile, ProductCatalog, ProductItem, Project } from "./types/project";

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

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const uid = () => crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

function loadState(): AppState {
  const fallbackProject = clone(sampleProjectData) as Project;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AppState;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    activeProjectId: fallbackProject.id,
    projects: [fallbackProject],
    assumptions: assumptionsData as Assumptions,
    products: productsData as ProductCatalog,
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
  state.projects = state.projects.map((item) => (item.id === project.id ? project : item));
  saveState();
  render();
}

function money(value: number, project = activeProject()) {
  return `${project.currency} ${numberFormat.format(value)}`;
}

function formatEnergy(wh: number) {
  return wh >= 1000 ? `${decimalFormat.format(wh / 1000)} kWh` : `${numberFormat.format(wh)} Wh`;
}

function renderReport(project: Project): string {
  const result = calculateProject(project, state.assumptions);
  const recommendations = buildRecommendations(project, result);
  const costs = [
    estimateCosts(project, result, state.products, state.assumptions, "dc"),
    estimateCosts(project, result, state.products, state.assumptions, "hybrid"),
  ];
  const brand = brands.find((item) => item.id === project.brandProfileId) ?? brands[0];

  return eta.renderString(reportTemplate, {
    project,
    result,
    recommendations,
    costs,
    assumptions: state.assumptions,
    brand,
    generatedAt: new Date().toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }),
    money: (value: number) => money(value, project),
    formatEnergy,
    formatNumber: (value: number) => numberFormat.format(value),
    formatPercent: (value: number) => `${Math.round(value * 100)}%`,
  }) as string;
}

function projectField(project: Project, field: keyof Project, label: string, type = "text") {
  const value = project[field];
  return `
    <label>
      <span>${label}</span>
      <input type="${type}" data-project-field="${String(field)}" value="${String(value)}" />
    </label>
  `;
}

function renderLoadRows(project: Project) {
  return project.loads
    .map(
      (load) => `
      <tr>
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

function renderProducts() {
  const productEntries = Object.entries(state.products) as Array<[keyof ProductCatalog, ProductItem[]]>;

  return productEntries
    .map(
      ([section, items]) => `
        <details>
          <summary>${String(section).replace(/([A-Z])/g, " $1")}</summary>
          <div class="price-list">
            ${items
              .map(
                (item) => `
                  <label>
                    <span>${item.name}</span>
                    <input type="number" min="0" step="1" data-product-section="${section}" data-product-id="${item.id}" value="${item.unitCost}" />
                  </label>
                `,
              )
              .join("")}
          </div>
        </details>
      `,
    )
    .join("");
}

function render() {
  if (!app) return;

  const project = activeProject();
  const result = calculateProject(project, state.assumptions);
  const recommendations = buildRecommendations(project, result);
  const dcCost = estimateCosts(project, result, state.products, state.assumptions, "dc");
  const hybridCost = estimateCosts(project, result, state.products, state.assumptions, "hybrid");
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
          <button type="button" data-print>Print report</button>
        </div>
      </header>

      <main class="planner-grid">
        <section class="panel project-panel">
          <div class="section-heading">
            <span>Project</span>
            <strong>${project.name}</strong>
          </div>
          <div class="form-grid">
            ${projectField(project, "name", "Project name")}
            ${projectField(project, "country", "Country")}
            ${projectField(project, "currency", "Currency")}
            ${projectField(project, "systemVoltage", "System voltage", "number")}
            ${projectField(project, "sunHours", "Sun hours", "number")}
            ${projectField(project, "autonomyDays", "Autonomy days", "number")}
            <label>
              <span>Brand profile</span>
              <select data-project-field="brandProfileId">
                ${brands.map((item) => `<option value="${item.id}" ${item.id === project.brandProfileId ? "selected" : ""}>${item.name}</option>`).join("")}
              </select>
            </label>
          </div>
        </section>

        <section class="panel metrics-panel">
          <div class="metric"><span>Total daily Wh</span><strong>${formatEnergy(result.totalDailyWh)}</strong></div>
          <div class="metric"><span>Peak load</span><strong>${numberFormat.format(result.peakLoadW)} W</strong></div>
          <div class="metric"><span>Surge load</span><strong>${numberFormat.format(result.surgeLoadW)} W</strong></div>
          <div class="metric"><span>Critical load energy</span><strong>${formatEnergy(result.criticalDailyWh)}</strong></div>
        </section>

        <section class="panel loads-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Loads</span>
              <strong>${project.loads.length} device groups</strong>
            </div>
            <button type="button" data-add-load>Add load</button>
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
                const estimate = option.id === "dc" ? dcCost : hybridCost;
                return `
                  <article class="option-card">
                    <h2>${option.name}</h2>
                    <p>${option.summary}</p>
                    <dl>
                      <div><dt>Adjusted energy</dt><dd>${formatEnergy(sizing.adjustedDailyWh)}</dd></div>
                      <div><dt>Battery</dt><dd>${formatEnergy(sizing.requiredBatteryWh)}</dd></div>
                      <div><dt>Solar array</dt><dd>${numberFormat.format(sizing.recommendedSolarArrayW)} W</dd></div>
                      <div><dt>MPPT current</dt><dd>${sizing.recommendedMpptCurrentA} A</dd></div>
                      ${option.id === "hybrid" ? `<div><dt>Inverter</dt><dd>${numberFormat.format(sizing.recommendedInverterW)} W</dd></div>` : ""}
                      <div><dt>Estimate</dt><dd>${money(estimate.total, project)}</dd></div>
                    </dl>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>

        <section class="panel assumptions-panel">
          <div class="section-heading">
            <span>Editable assumptions</span>
            <strong>Efficiencies and prices</strong>
          </div>
          <div class="assumption-grid">
            ${[
              ["dcDistributionEfficiency", "DC efficiency"],
              ["hybridDcEfficiency", "Hybrid DC efficiency"],
              ["inverterEfficiency", "Inverter efficiency"],
              ["batteryDepthOfDischarge", "Battery DoD"],
              ["arrayDerateFactor", "PV derate"],
              ["installationRate", "Installation rate"],
              ["contingencyRate", "Contingency rate"],
            ]
              .map(
                ([field, label]) => `
                  <label>
                    <span>${label}</span>
                    <input type="number" min="0" max="2" step="0.01" data-assumption-field="${field}" value="${state.assumptions[field as keyof Assumptions]}" />
                  </label>
                `,
              )
              .join("")}
          </div>
          <div class="product-editor">${renderProducts()}</div>
        </section>

        <section class="panel report-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Printable report</span>
              <strong>Ready for review</strong>
            </div>
            <button type="button" data-print>Print</button>
          </div>
          <div id="report">${renderReport(project)}</div>
        </section>
      </main>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelector("[data-project-switch]")?.addEventListener("change", (event) => {
    state.activeProjectId = (event.target as HTMLSelectElement).value;
    saveState();
    render();
  });

  document.querySelectorAll("[data-project-field]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      const project = clone(activeProject());
      const field = target.dataset.projectField as keyof Project;
      const numericFields = new Set<keyof Project>(["systemVoltage", "sunHours", "autonomyDays"]);
      (project[field] as string | number) = numericFields.has(field) ? Number(target.value) : target.value;
      setActiveProject(project);
    });
  });

  document.querySelectorAll("[data-load-field]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      const project = clone(activeProject());
      const load = project.loads.find((item) => item.id === target.dataset.loadId);
      if (!load) return;
      const field = target.dataset.loadField ?? "";
      if (field === "critical") {
        load.critical = (target as HTMLInputElement).checked;
      } else if (field === "name" || field === "currentType") {
        (load as unknown as Record<string, string>)[field] = target.value;
      } else {
        (load as unknown as Record<string, number>)[field] = Number(target.value);
      }
      setActiveProject(project);
    });
  });

  document.querySelectorAll("[data-remove-load]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = clone(activeProject());
      project.loads = project.loads.filter((load) => load.id !== (button as HTMLButtonElement).dataset.removeLoad);
      setActiveProject(project);
    });
  });

  document.querySelector("[data-add-load]")?.addEventListener("click", () => {
    const project = clone(activeProject());
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

  document.querySelector("[data-new-project]")?.addEventListener("click", () => {
    const project = clone(sampleProjectData) as Project;
    project.id = uid();
    project.name = "Untitled solar project";
    project.updatedAt = new Date().toISOString();
    state.projects = [...state.projects, project];
    state.activeProjectId = project.id;
    saveState();
    render();
  });

  document.querySelector("[data-load-sample]")?.addEventListener("click", () => {
    const sample = clone(sampleProjectData) as Project;
    sample.id = uid();
    sample.updatedAt = new Date().toISOString();
    state.projects = [...state.projects, sample];
    state.activeProjectId = sample.id;
    saveState();
    render();
  });

  document.querySelectorAll("[data-assumption-field]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const field = target.dataset.assumptionField as keyof Assumptions;
      (state.assumptions[field] as number) = Number(target.value);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-product-id]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const section = target.dataset.productSection as keyof ProductCatalog;
      const product = state.products[section].find((item) => item.id === target.dataset.productId);
      if (product) {
        product.unitCost = Number(target.value);
        saveState();
        render();
      }
    });
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });
}

render();
