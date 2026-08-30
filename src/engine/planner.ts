import { calculateProject } from "./calculations";
import { estimateCosts } from "./costing";
import { evaluateEquipmentPlan, generateEquipmentPlan, getEquipmentActuals } from "./equipment";
import { buildRecommendations } from "./recommendations";
import type { Assumptions, EquipmentPlan, Project } from "../types/project";
import { selectedSystemFor, systemOptionName } from "../utils/format";

export function currentPlan(project: Project, generatedPlan: EquipmentPlan): EquipmentPlan {
  return project.equipmentPlanMode === "custom" && project.equipmentPlan ? project.equipmentPlan : generatedPlan;
}

export function getProjectBundle(project: Project, assumptions: Assumptions) {
  const result = calculateProject(project, assumptions);
  const generatedPlan = generateEquipmentPlan(result, project.equipmentDefaults);
  const plan = currentPlan(project, generatedPlan);
  const evaluations = {
    dc: evaluateEquipmentPlan(result, plan, "dc"),
    hybrid: evaluateEquipmentPlan(result, plan, "hybrid"),
  };
  const costs = [
    estimateCosts(project, plan, project.pricing, assumptions, "dc"),
    estimateCosts(project, plan, project.pricing, assumptions, "hybrid"),
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

export function getSelectedReportBundle(project: Project, assumptions: Assumptions) {
  const bundle = getProjectBundle(project, assumptions);
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
