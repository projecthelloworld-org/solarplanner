import type { EquipmentPlan, OptionPlanState, PricingSettings, ProductCatalog, SystemOptionId } from "../types/project";

export function priceIdentity(plan: EquipmentPlan, field: keyof PricingSettings): string {
  const s = plan.shared;
  switch (field) {
    case "panelUnitUsd": return `panel:${s.panelProductId ?? "custom"}:${s.panelWatts}`;
    case "batteryUnitUsd": return `battery:${s.batteryProductId ?? "custom"}:${s.batteryVoltage}:${s.batteryAh}`;
    case "controllerUnitUsd": return `controller:${plan.dc.controllerProductId ?? "custom"}:${plan.dc.mpptAmps}`;
    case "hybridControllerUnitUsd": return `controller:${plan.hybrid.controllerProductId ?? "custom"}:${plan.hybrid.mpptAmps}`;
    case "inverterUnitUsd": return `inverter:${plan.hybrid.inverterProductId ?? "custom"}:${plan.hybrid.inverterWatts}`;
    default: return `${field}:${s.panelCount * s.panelWatts <= 300 ? "compact" : "hub"}`;
  }
}

export function priceDetails(plan: EquipmentPlan, pricing: PricingSettings, state: OptionPlanState, system: SystemOptionId, catalog: ProductCatalog) {
  const s = plan.shared;
  const entries = [
    { field: "panelUnitUsd", label: "Solar panels", quantity: s.panelCount, reference: catalog.solarPanels.some(p => p.id === s.panelProductId && p.watts === s.panelWatts) },
    { field: "batteryUnitUsd", label: "Batteries", quantity: s.batteryCount, reference: catalog.batteries.some(p => p.id === s.batteryProductId && p.voltage === s.batteryVoltage && p.ampHours === s.batteryAh) },
    { field: system === "dc" ? "controllerUnitUsd" : "hybridControllerUnitUsd", label: "Separate controllers", quantity: plan[system].controllerCount, reference: catalog.chargeControllers.some(p => p.id === plan[system].controllerProductId && p.amps === plan[system].mpptAmps) },
    ...(system === "hybrid" ? [{ field: "inverterUnitUsd", label: "Inverters", quantity: plan.hybrid.inverterCount, reference: catalog.hybridInverters.some(p => p.id === plan.hybrid.inverterProductId && p.watts === plan.hybrid.inverterWatts) }] : []),
    { field: "dcDistributionUnitUsd", label: "DC distribution", quantity: plan.balance.dcDistributionCount },
    ...(system === "hybrid" ? [{ field: "acDistributionUnitUsd", label: "AC distribution", quantity: plan.balance.acDistributionCount }] : []),
    { field: "cablingUnitUsd", label: "Cabling", quantity: plan.balance.cablingCount },
    { field: "earthingUnitUsd", label: "Earthing", quantity: plan.balance.earthingCount },
    { field: "monitoringUnitUsd", label: "Monitoring", quantity: plan.balance.monitoringCount },
  ];
  return entries.map(entry => {
    const field = entry.field as keyof PricingSettings;
    const overridden = state.pricingOverrides[field] !== undefined;
    const review = entry.quantity > 0 && overridden && state.quoteEquipment?.[field] !== priceIdentity(plan, field);
    const unitUsd = pricing[field] ?? pricing.controllerUnitUsd;
    const basis = overridden ? "User quotation" : entry.reference === true ? "Reference price" : "Unverified allowance";
    return { ...entry, field, overridden, review, unitUsd, totalUsd: Math.round((entry.quantity * unitUsd + Number.EPSILON) * 100) / 100, basis, note: entry.quantity === 0 ? "" : review ? "Confirm retained quotation: equipment changed or original reference is unknown." : entry.reference === false ? "No matching product price; confirm a quotation for this capacity." : "" };
  });
}
