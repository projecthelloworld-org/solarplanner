import type { Assumptions, Project } from "../types/project";
import type { getSelectedReportBundle } from "../engine/planner";
import { CALCULATION_REVISION, engineeringFor } from "../engine/engineering";
import { loadAdvancedFields, loadFieldApplies } from "../engine/fields";

export interface EvidenceSection { title: string; headings: string[]; rows: Array<Array<string | number>> }
export function reportEvidence(project: Project, assumptions: Assumptions, bundle: ReturnType<typeof getSelectedReportBundle>, generatedAt = new Date().toISOString()): EvidenceSection[] {
  const efficiency = bundle.result.effectiveEfficiency;
  const sizing = bundle.selectedSizing;
  const settings = engineeringFor(project, bundle.selectedSystem);
  const sections: EvidenceSection[] = [
    { title: "Calculation Record", headings: ["Item", "Value"], rows: [["Calculation revision", CALCULATION_REVISION], ["Generated at (UTC)", generatedAt], ["Plan scope", `Independent ${bundle.selectedSystemName} plan`], ["Startup assumption", project.startupMode === "all" ? "All active loads restart together" : "One row or named group starts while others run"]] },
    { title: "Effective Calculation Assumptions", headings: ["Assumption", "Value / basis"], rows: [
      ...Object.entries(assumptions).filter(([, value]) => typeof value === "number").map(([key, value]): [string, number | string] => [key === "inverterEfficiency" ? "Fallback inverter efficiency" : key, value]),
      ["Effective hybrid inverter efficiency", efficiency?.value ?? assumptions.inverterEfficiency], ["Efficiency source", `${efficiency?.source ?? "fallback"}${efficiency?.productId ? `; ${efficiency.productId}` : ""}`],
      ["Energized but unloaded h/day", project.inverterSettings?.unloadedHoursPerDay ?? "Not entered; idle energy omitted"], ["Hybrid idle energy Wh/day", bundle.result.idleDailyWh ?? 0],
      ["PV short-circuit current factor", settings.pvIscFactor ?? 1.25],
      ["PV derate boundary", "Combined array/environment/controller/charging allowance; inverter conversion is handled separately. Do not count these losses twice."],
      ["Autonomy basis", "All active loads; critical is a priority label, not a separate autonomy scenario."],
    ] },
    { title: "Exact Sizing and Installed Capacity", headings: ["Metric", "Required", "Installed", "Margin", "Unit"], rows: [
      ["Battery nominal energy", sizing.requiredBatteryWh, bundle.actuals.batteryWh, bundle.actuals.batteryWh - sizing.requiredBatteryWh, "Wh"],
      ["Solar array", sizing.recommendedSolarArrayW, bundle.actuals.solarArrayW, bundle.actuals.solarArrayW - sizing.recommendedSolarArrayW, "W"],
      ["Controller output", bundle.selectedMpptRequirement, bundle.selectedSystem === "dc" ? bundle.actuals.dcMpptA : bundle.actuals.hybridMpptA, (bundle.selectedSystem === "dc" ? bundle.actuals.dcMpptA : bundle.actuals.hybridMpptA) - bundle.selectedMpptRequirement, "A"],
      ...(bundle.selectedSystem === "hybrid" ? [["Inverter continuous selection target", bundle.effectiveInverterRequirementW, bundle.actuals.hybridInverterW, bundle.actuals.hybridInverterW - bundle.effectiveInverterRequirementW, "W"]] : []),
    ] },
    { title: "Storage and Load Performance", headings: ["Metric", "Value", "Unit"], rows: [
      ["Total load energy", bundle.result.totalDailyWh, "Wh/day"], ["Peak load", bundle.result.peakLoadW, "W"], ["Startup load", bundle.result.surgeLoadW, "W"], ["Critical load energy", bundle.result.criticalDailyWh, "Wh/day"],
      ["Adjusted daily energy", sizing.adjustedDailyWh, "Wh/day"], ["Installed nominal storage", bundle.actuals.batteryWh, "Wh"], ["Usable storage at configured DoD", bundle.usableBatteryWh, "Wh"],
      ["Modeled autonomy without solar", bundle.modeledAutonomyDays ?? "Not applicable", "days"], ["Autonomy retaining design reserve allowance", bundle.designAutonomyDays ?? "Not applicable", "days"],
      ["Limitations", "Modeled energy balance, not guaranteed runtime; aging, temperature and unresolved losses are not inferred.", ""],
    ] },
    { title: "Price Basis", headings: ["Item", "Quantity", "Unit USD", "Line USD", "Basis", "Review"], rows: bundle.priceDetails.map(p => [p.label, p.quantity, p.unitUsd, p.totalUsd, p.basis, p.note]) },
    { title: "Equipment Checks", headings: ["Check", "Result", "Evidence / missing information"], rows: bundle.selectedEvaluation.checks.map((c) => [c.label, c.status ?? (c.passed ? "passed" : "failed"), c.detail ?? `${c.actual} ${c.unit} installed; ${c.required} ${c.unit} required.`]) },
    { title: "Selected Equipment References", headings: ["Component", "Reference", "Specification evidence"], rows: Object.entries(bundle.products).filter(([group]) => group !== "inverter" || bundle.selectedSystem === "hybrid").map(([group, product]) => [group, product?.name ?? "Custom / unverified", product ? [product.specificationRevision, product.specificationCheckedOn ? `Checked ${product.specificationCheckedOn}` : "Check date unverified", product.specificationBasis, ...(product.specificationSources ?? [])].filter(Boolean).join("; ") : "Matching manufacturer specifications unavailable"]) },
    { title: "Advanced Load Inputs", headings: ["Load", "Input", "Value"], rows: bundle.result.loadRows.flatMap(({ load }) => [
      ...loadAdvancedFields.filter((field) => loadFieldApplies(load.currentType, field.key)).map((field): Array<string | number> => [load.name, field.label, load[field.key] ?? "Not provided"]),
      [load.name, "Startup group", load.startupGroup || (project.startupMode === "all" ? "All active loads" : "This row")],
    ]) },
  ];
  const engineeringRows: Array<Array<string | number>> = [];
  for (const group of ["battery", "inverter", "controller", "panel"] as const) {
    for (const [key, value] of Object.entries(settings[group] ?? {})) if (value !== undefined) engineeringRows.push([group, key, value, "User override"]);
  }
  for (const key of ["minimumCellTemperatureC", "maximumCellTemperatureC", "pvIscFactor"] as const) if (settings[key] !== undefined) engineeringRows.push(["PV", key, settings[key]!, "User input"]);
  for (const [i, row] of (settings.pvAssignments ?? []).entries()) engineeringRows.push(["PV", `Input allocation ${i + 1}`, `${row.target} controller ${row.controllerIndex}, input ${row.input}: ${row.series} series × ${row.parallel} parallel`, "User input"]);
  if (engineeringRows.length) sections.push({ title: "Manual Engineering Inputs", headings: ["Component", "Input", "Value", "Basis"], rows: engineeringRows });
  return sections.map((section) => ({ ...section, rows: section.rows.map((row) => row.map((cell) => typeof cell === "number" ? Number(cell.toFixed(8)) : cell)) }));
}
