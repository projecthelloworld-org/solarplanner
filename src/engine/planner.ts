import { calculateProject } from "./calculations";
import { estimateCosts } from "./costing";
import { evaluateEquipmentPlan, generateEquipmentPlan, getEquipmentActuals, isStarterPricing, pricingForGeneratedPlan } from "./equipment";
import { buildRecommendations } from "./recommendations";
import type { Assumptions, EquipmentPlan, Project } from "../types/project";
import { selectedSystemFor, systemOptionName } from "../utils/format";

export function currentPlan(project: Project, generatedPlan: EquipmentPlan): EquipmentPlan {
  return project.equipmentPlanMode === "custom" && project.equipmentPlan ? project.equipmentPlan : generatedPlan;
}

export function getProjectBundle(project: Project, assumptions: Assumptions) {
  const result = calculateProject(project, assumptions);
  const generatedPlan = generateEquipmentPlan(result, project.equipmentDefaults, project, assumptions);
  const plan = currentPlan(project, generatedPlan);
  const pricing = project.equipmentPlanMode === "generated" && isStarterPricing(project.pricing)
    ? pricingForGeneratedPlan(generatedPlan, project.pricing)
    : project.pricing;
  const evaluatedProject = { ...project, pricing };
  const evaluations = {
    dc: evaluateEquipmentPlan(result, plan, "dc", evaluatedProject, assumptions),
    hybrid: evaluateEquipmentPlan(result, plan, "hybrid", evaluatedProject, assumptions),
  };
  const costs = [
    estimateCosts(project, plan, pricing, assumptions, "dc"),
    estimateCosts(project, plan, pricing, assumptions, "hybrid"),
  ];

  return {
    result,
    generatedPlan,
    plan,
    actuals: getEquipmentActuals(plan),
    evaluations,
    pricing,
    costs,
    recommendations: buildRecommendations(project, result, evaluations.dc),
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
    selectedMpptRequirement: selectedEvaluation.checks.find((check) => check.label === "MPPT/controller")!.required,
    selectedCost,
    selectedRecommendation,
  };
}
