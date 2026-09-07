import type { Assumptions, CostEstimate, CostLine, EquipmentPlan, PricingSettings, Project, SystemOptionId } from "../types/project";
import { inverterDescription } from "./equipment";

const cents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
const convert = (usd: number, exchangeRate: number): number => cents(usd * exchangeRate);

function line(category: string, description: string, quantity: number, unitCostUsd: number, exchangeRate: number): CostLine {
  const totalUsd = cents(quantity * unitCostUsd);

  return {
    category,
    description,
    quantity,
    unitCostUsd,
    unitCost: convert(unitCostUsd, exchangeRate),
    totalUsd,
    total: convert(totalUsd, exchangeRate),
  };
}

export function estimateCosts(
  project: Project,
  plan: EquipmentPlan,
  pricing: PricingSettings,
  assumptions: Assumptions,
  systemId: SystemOptionId,
): CostEstimate {
  const exchangeRate = project.currency === "USD" ? 1 : project.usdExchangeRate;
  const lines: CostLine[] = [
    line("Solar panels", `${plan.shared.panelCount} panel(s) x ${plan.shared.panelWatts} W`, plan.shared.panelCount, pricing.panelUnitUsd, exchangeRate),
    line(
      "LiFePO4 battery storage",
      `${plan.shared.batteryCount} battery/batteries x ${plan.shared.batteryVoltage} V x ${plan.shared.batteryAh} Ah`,
      plan.shared.batteryCount,
      pricing.batteryUnitUsd,
      exchangeRate,
    ),
  ];

  if (systemId === "dc") {
    lines.push(
      line(
        "Charge controller or hybrid inverter",
        `${plan.dc.controllerCount} controller(s) x ${plan.dc.mpptAmps} A MPPT`,
        plan.dc.controllerCount,
        pricing.controllerUnitUsd,
        exchangeRate,
      ),
    );
  } else {
    lines.push(
      line(
        "Charge controller or hybrid inverter",
        `${plan.hybrid.controllerCount} controller(s) x ${plan.hybrid.mpptAmps} A MPPT`,
        plan.hybrid.controllerCount,
        pricing.hybridControllerUnitUsd ?? pricing.controllerUnitUsd,
        exchangeRate,
      ),
      line(
        "Hybrid inverter capacity",
        `${plan.hybrid.inverterCount} inverter(s) x ${plan.hybrid.inverterWatts} W; ${inverterDescription(plan)}`,
        plan.hybrid.inverterCount,
        pricing.inverterUnitUsd,
        exchangeRate,
      ),
    );
  }

  lines.push(
    line(
      "DC distribution and protection",
      "DC breaker board, fuses, labels, and surge protection",
      plan.balance.dcDistributionCount,
      pricing.dcDistributionUnitUsd,
      exchangeRate,
    ),
  );

  if (systemId === "hybrid") {
    lines.push(
      line(
        "AC distribution for hybrid systems",
        "AC breaker board, RCD, outlets, and labels",
        plan.balance.acDistributionCount,
        pricing.acDistributionUnitUsd,
        exchangeRate,
      ),
    );
  }

  lines.push(
    line("Cabling and connectors", "PV, battery, and load cabling with MC4/connectors", plan.balance.cablingCount, pricing.cablingUnitUsd, exchangeRate),
    line(
      "Earthing and lightning protection",
      "Earthing rod, bonding, surge, and lightning protection kit",
      plan.balance.earthingCount,
      pricing.earthingUnitUsd,
      exchangeRate,
    ),
    line("Monitoring", "Battery monitor and remote energy logging", plan.balance.monitoringCount, pricing.monitoringUnitUsd, exchangeRate),
  );

  const subtotalUsd = cents(lines.reduce((sum, item) => sum + item.totalUsd, 0));
  const installationUsd = cents(subtotalUsd * assumptions.installationRate);
  const contingencyUsd = cents((subtotalUsd + installationUsd) * assumptions.contingencyRate);
  const totalUsd = cents(subtotalUsd + installationUsd + contingencyUsd);

  return {
    systemId,
    lines,
    subtotalUsd,
    subtotal: cents(lines.reduce((sum, item) => sum + item.total, 0)),
    installationUsd,
    installation: convert(installationUsd, exchangeRate),
    contingencyUsd,
    contingency: convert(contingencyUsd, exchangeRate),
    totalUsd,
    total: cents(lines.reduce((sum, item) => sum + item.total, 0) + convert(installationUsd, exchangeRate) + convert(contingencyUsd, exchangeRate)),
    currency: project.currency,
    exchangeRate,
  };
}
