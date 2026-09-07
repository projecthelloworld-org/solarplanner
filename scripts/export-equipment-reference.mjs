import { readFile, writeFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("../src/data/default-products.json", import.meta.url), "utf8"));
const rows = [["Category", "Product ID", "Product name", "Unit", "Unit price (USD)", "Power (W)", "Energy (Wh)", "Nameplate voltage (V)", "Battery capacity (Ah)", "Nominal input/system voltage (V)", "Supported system voltages (V)", "Controller current (A)", "Inverter type", "Included MPPT (A)", "Maximum PV power (W)", "PV power by voltage", "Maximum PV voltage (V)", "Maximum series units", "Maximum parallel strings", "Continuous battery discharge (A)", "Maximum array allowance (W)", "Specification sources", "Price evidence", "Observed matching-product USD range", "Notes"]];
for (const [category, items] of Object.entries(catalog)) {
  for (const item of items) {
    const evidence = item.priceEvidence ?? [];
    const matched = evidence.filter((source) => source.basis === "listed-product").map((source) => source.amount / source.unitsPerUsd);
    rows.push([category, item.id, item.name, item.unit, item.unitCost, item.watts, item.wattHours, item.voltage, item.ampHours, item.systemVoltage,
      item.supportedVoltages?.join(" / "), item.amps, item.inverterType, item.integratedMpptA, item.maxPvWatts,
      item.pvWattsByVoltage ? Object.entries(item.pvWattsByVoltage).map(([v, w]) => `${v} V: ${w} W`).join("; ") : "",
      item.maxPvVoltage, item.maxSeries ?? "Unknown", item.maxParallel ?? "Unknown", item.continuousDischargeA ?? "Unknown", item.maxArrayWatts,
      item.specificationSources?.join(" | "),
      evidence.map((source) => `${source.checkedOn}; ${source.country}; ${source.currency} ${source.amount}; 1 USD = ${source.unitsPerUsd} ${source.currency}; ${source.basis}; ${source.taxDelivery}; ${source.url}`).join(" | "),
      matched.length > 1 ? `${Math.min(...matched).toFixed(2)} - ${Math.max(...matched).toFixed(2)}` : "Insufficient comparable observations",
      item.priceNotes ?? "Existing planning allowance; see docs/PRICING.md. Not an installed quotation."]);
  }
}
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
await writeFile(new URL("../EQUIPMENT_PRICING_REFERENCE.csv", import.meta.url), "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\n") + "\n");
console.log(`Exported ${rows.length - 1} reference products.`);
