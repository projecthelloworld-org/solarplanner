import { Eta } from "eta";
import reportTemplate from "../templates/report.eta?raw";
import { getSelectedReportBundle } from "../engine/planner";
import { includedMpptAmps, inverterDescription } from "../engine/equipment";
import type { Assumptions, BrandProfile, Project } from "../types/project";
import { decimalFormat, formatEnergy, integerFormat, money, moneyDetailed, moneyUsd } from "../utils/format";
import { csvLine } from "./csv";

const eta = new Eta();

function brandFor(project: Project, brands: BrandProfile[]): BrandProfile {
  return brands.find((item) => item.id === project.brandProfileId) ?? brands[0];
}

export function renderProjectReport(project: Project, assumptions: Assumptions, brands: BrandProfile[]): string {
  const bundle = getSelectedReportBundle(project, assumptions);
  const brand = brandFor(project, brands);

  return eta.renderString(reportTemplate, {
    project,
    ...bundle,
    inverterDescription: inverterDescription(bundle.plan),
    includedMpptA: includedMpptAmps(bundle.plan),
    assumptions,
    brand,
    generatedAt: new Date().toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }),
    money: (value: number) => money(value, project),
    moneyDetailed: (value: number) => moneyDetailed(value, project),
    moneyUsd,
    formatEnergy,
    formatNumber: (value: number) => decimalFormat.format(value),
    formatDecimal: (value: number) => decimalFormat.format(value),
    formatPercent: (value: number) => `${Math.round(value * 100)}%`,
  }) as string;
}

export function buildProjectCsv(project: Project, assumptions: Assumptions, brands: BrandProfile[]): string {
  const bundle = getSelectedReportBundle(project, assumptions);
  const brand = brandFor(project, brands);
  const rows: Array<Array<string | number | boolean | undefined>> = [];
  const selectedLines = bundle.selectedRecommendation.lines;

  rows.push(["Project Summary"]);
  rows.push(["Project name", project.name]);
  rows.push(["Equipment plan", project.equipmentPlanMode === "custom" ? "Edited plan" : "Load-generated plan"]);
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
      Number(row.dailyWh.toFixed(2)),
    ]);
  });
  rows.push(["Total daily energy", "", "", "", "", "", "", "", Number(bundle.result.totalDailyWh.toFixed(2))]);
  rows.push([]);

  rows.push(["Technical Sizing Summary", bundle.selectedSystemName]);
  rows.push(["Adjusted daily energy", formatEnergy(bundle.selectedSizing.adjustedDailyWh)]);
  rows.push(["Required LiFePO4 battery", formatEnergy(bundle.selectedSizing.requiredBatteryWh)]);
  rows.push(["Recommended solar array", `${integerFormat.format(bundle.selectedSizing.recommendedSolarArrayW)} W`]);
  rows.push(["Recommended MPPT current", `${bundle.selectedMpptRequirement} A`, "Larger of demand and installed array requirement"]);
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
    rows.push(["DC MPPT/controller", `${bundle.plan.dc.controllerCount} controller(s) x ${bundle.plan.dc.mpptAmps} A`, `${bundle.actuals.dcMpptA} A total`, `${bundle.selectedMpptRequirement} A`]);
  } else {
    rows.push([
      "Hybrid MPPT/controller",
      `${bundle.plan.hybrid.controllerCount} separate controller(s) x ${bundle.plan.hybrid.mpptAmps} A + ${includedMpptAmps(bundle.plan)} A integrated MPPT`,
      `${bundle.actuals.hybridMpptA} A total`,
      `${bundle.selectedMpptRequirement} A`,
    ]);
    rows.push([
      "Hybrid inverter",
      `${bundle.plan.hybrid.inverterCount} inverter(s) x ${bundle.plan.hybrid.inverterWatts} W; ${inverterDescription(bundle.plan)}`,
      `${integerFormat.format(bundle.actuals.hybridInverterW)} W`,
      `${integerFormat.format(bundle.selectedSizing.recommendedInverterW)} W`,
    ]);
  }
  rows.push([]);

  rows.push([bundle.selectedRecommendation.name]);
  rows.push(["Status", bundle.selectedEvaluation.status]);
  bundle.selectedEvaluation.warnings.forEach((warning) => rows.push(["Warning", warning]));
  bundle.selectedEvaluation.notes.forEach((note) => rows.push(["Planning note", note]));
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
  rows.push(["Installation", "Planning allowance based on editable assumption", 1, `${Math.round(assumptions.installationRate * 100)}%`, money(bundle.selectedCost.installation, project)]);
  rows.push(["Contingency", "Planning allowance for local variance and missing items", 1, `${Math.round(assumptions.contingencyRate * 100)}%`, money(bundle.selectedCost.contingency, project)]);
  rows.push(["Estimated total", "", "", "", `${money(bundle.selectedCost.total, project)} (${moneyUsd(bundle.selectedCost.totalUsd)})`]);

  return rows.map(csvLine).join("\n");
}

export function projectCsvFilename(project: Project): string {
  return `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "hello-solar-report"}-report.csv`;
}
