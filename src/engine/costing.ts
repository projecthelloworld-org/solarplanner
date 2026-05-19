import type { Assumptions, CalculationResult, CostEstimate, CostLine, ProductCatalog, ProductItem, Project } from "../types/project";

const ceilDiv = (value: number, unit: number): number => Math.max(1, Math.ceil(value / unit));

const cheapestByCapacity = (items: ProductItem[], key: "watts" | "wattHours" | "amps", required: number): ProductItem => {
  const sorted = [...items].sort((a, b) => {
    const aCapacity = a[key] ?? 1;
    const bCapacity = b[key] ?? 1;
    return a.unitCost / aCapacity - b.unitCost / bCapacity;
  });
  const fitting = sorted.find((item) => (item[key] ?? 0) >= required);
  return fitting ?? sorted[0];
};

const fixed = (items: ProductItem[], category: string, description?: string): CostLine => {
  const item = items[0];
  return {
    category,
    description: description ?? item.name,
    quantity: 1,
    unitCost: item.unitCost,
    total: item.unitCost,
  };
};

function capacityLine(
  category: string,
  items: ProductItem[],
  key: "watts" | "wattHours" | "amps",
  required: number,
  descriptionSuffix = "",
): CostLine {
  const item = cheapestByCapacity(items, key, required);
  const capacity = item[key] ?? required;
  const quantity = ceilDiv(required, capacity);

  return {
    category,
    description: `${item.name}${descriptionSuffix}`,
    quantity,
    unitCost: item.unitCost,
    total: quantity * item.unitCost,
  };
}

export function estimateCosts(
  project: Project,
  result: CalculationResult,
  products: ProductCatalog,
  assumptions: Assumptions,
  systemId: "dc" | "hybrid",
): CostEstimate {
  const sizing = systemId === "dc" ? result.dc : result.hybrid;
  const lines: CostLine[] = [
    capacityLine("Solar panels", products.solarPanels, "watts", sizing.recommendedSolarArrayW),
    capacityLine("LiFePO4 battery storage", products.batteries, "wattHours", sizing.requiredBatteryWh),
  ];

  if (systemId === "dc") {
    lines.push(capacityLine("Charge controller or hybrid inverter", products.chargeControllers, "amps", sizing.recommendedMpptCurrentA));
  } else {
    lines.push(
      capacityLine(
        "Charge controller or hybrid inverter",
        products.hybridInverters,
        "watts",
        Math.max(sizing.recommendedInverterW, sizing.recommendedSolarArrayW),
        " with AC output",
      ),
    );
  }

  lines.push(fixed(products.dcDistribution, "DC distribution and protection"));

  if (systemId === "hybrid") {
    lines.push(fixed(products.acDistribution, "AC distribution for hybrid systems"));
  }

  lines.push(
    fixed(products.cabling, "Cabling and connectors"),
    fixed(products.earthing, "Earthing and lightning protection"),
    fixed(products.monitoring, "Monitoring"),
  );

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const installation = Math.round(subtotal * assumptions.installationRate);
  const contingency = Math.round((subtotal + installation) * assumptions.contingencyRate);

  return {
    systemId,
    lines,
    subtotal,
    installation,
    contingency,
    total: subtotal + installation + contingency,
  };
}
