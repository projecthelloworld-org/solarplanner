import { loadAdvancedFields, loadFieldApplies, ratingFields } from "../engine/fields";
import { engineeringFor } from "../engine/engineering";
import type { EngineeringSettings, LoadItem, ProductItem, Project } from "../types/project";
import { attribute, escapeHtml } from "../utils/html";

export function renderLoadAdvanced(load: LoadItem): string {
  return `<details class="load-advanced"><summary>Advanced</summary><div class="mini-grid">
    ${loadAdvancedFields.map((f) => `<label data-advanced-load-field="${f.key}" ${loadFieldApplies(load.currentType, f.key) ? "" : "hidden"}><span>${f.label}</span><input ${loadFieldApplies(load.currentType, f.key) ? "" : "disabled"} aria-label="${f.label}" type="number" min="${f.min}" max="${f.max}" step="any" data-load-id="${attribute(load.id)}" data-load-field="${f.key}" value="${attribute(load[f.key] ?? "")}" placeholder="Unknown" /></label>`).join("")}
    <label><span>Startup group</span><input aria-label="Startup group" maxlength="100" data-load-id="${attribute(load.id)}" data-load-field="startupGroup" value="${attribute(load.startupGroup ?? "")}" placeholder="This row only" /></label>
  </div></details>`;
}

export function renderAdvancedSettings(project: Project, refs: { panel?: ProductItem; battery?: ProductItem; controller?: ProductItem; inverter?: ProductItem }): string {
  const settings = engineeringFor(project, project.selectedSystem);
  const assignment = settings.pvAssignments ?? [];
  return `<details class="advanced-equipment"><summary>Advanced equipment checks</summary><div class="accordion-body">
    <p class="comparison-note">Optional details for the selected ${project.selectedSystem === "dc" ? "DC" : "hybrid"} plan. Blank ratings use a matching manufacturer's specification when available; otherwise the check remains unverified. Entering a rating creates a manual specification override.</p>
    <label><span>Startup assumption</span><select data-project-field="startupMode"><option value="groups" ${project.startupMode !== "all" ? "selected" : ""}>One row or named group starts</option><option value="all" ${project.startupMode === "all" ? "selected" : ""}>All active loads restart together</option></select></label>
    ${project.selectedSystem === "hybrid" ? `<fieldset><legend>Inverter losses</legend><div class="mini-grid">
      <label><span>Efficiency source</span><select data-energy-field="mode"><option value="manufacturer" ${project.inverterSettings?.mode !== "manual" ? "selected" : ""}>Manufacturer / fallback</option><option value="manual" ${project.inverterSettings?.mode === "manual" ? "selected" : ""}>Manual override</option></select></label>
      <label><span>Manual efficiency (0–1)</span><input type="number" min="0.01" max="1" step="any" data-energy-field="efficiency" value="${attribute(project.inverterSettings?.efficiency ?? "")}" ${project.inverterSettings?.mode !== "manual" ? "disabled" : ""} /></label>
      <label><span>Energized but unloaded hours/day</span><input type="number" min="0" max="24" step="any" data-energy-field="unloadedHoursPerDay" value="${attribute(project.inverterSettings?.unloadedHoursPerDay ?? "")}" placeholder="Unknown; excluded" /></label>
      </div><p>Loaded losses already use efficiency. Only unloaded hours add idle energy; do not also add an idle appliance row.</p></fieldset>` : ""}
    ${(["battery", "inverter", "controller", "panel"] as const).filter((g) => g !== "inverter" || project.selectedSystem === "hybrid").map((group) => `<fieldset><legend>${group[0].toUpperCase() + group.slice(1)} ratings</legend><p>${escapeHtml(refs[group]?.name ?? "No matched reference")}</p><div class="mini-grid">${ratingFields[group].map((f) => `<label><span>${f.label}</span><input aria-label="${group}: ${f.label}" type="number" min="${f.min}" max="${f.max}" step="${f.integer ? 1 : "any"}" data-rating-group="${group}" data-rating-field="${f.key}" value="${attribute(settings[group]?.[f.key] ?? "")}" placeholder="${attribute(refs[group]?.[f.key] ?? "Unknown")}" /></label>`).join("")}</div></fieldset>`).join("")}
    <fieldset><legend>PV design conditions and allocation</legend><div class="mini-grid">
      ${([['minimumCellTemperatureC', 'Minimum design cell temperature °C', -100, 150], ['maximumCellTemperatureC', 'Maximum design cell temperature °C', -100, 150], ['pvIscFactor', 'PV short-circuit current factor', 1, 3]] as const).map(([key,label,min,max]) => `<label><span>${label}</span><input type="number" min="${min}" max="${max}" step="any" data-engineering-field="${key}" value="${attribute(settings[key] ?? "")}" placeholder="${key === "pvIscFactor" ? "1.25" : "Unknown"}" /></label>`).join("")}
    </div><p>Each row assigns identical modules to one input. Use a separate row for each physical controller/input; controller numbers start at 1.</p>
    <div class="pv-assignments">${assignment.map((a, i) => `<div class="pv-assignment" data-pv-assignment="${i}">
      <label><span>Controller</span><select data-pv-field="target"><option value="separate" ${a.target === "separate" ? "selected" : ""}>Separate</option><option value="integrated" ${a.target === "integrated" ? "selected" : ""}>Inverter MPPT</option></select></label>
      ${([['controllerIndex','Controller #'],['input','Input #'],['series','Modules in series'],['parallel','Parallel strings']] as const).map(([key,label])=>`<label><span>${label}</span><input type="number" min="1" max="100000" step="1" data-pv-field="${key}" value="${a[key]}" /></label>`).join("")}
      <button type="button" data-remove-pv="${i}">Remove allocation</button></div>`).join("")}</div>
      <button type="button" data-add-pv>Add PV input allocation</button>
    </fieldset></div></details>`;
}
