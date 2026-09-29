import type { ElectricalRatings } from "../types/project";
export interface RatingField { key: keyof ElectricalRatings; label: string; min: number; max: number; integer?: boolean }
const positive = (key: keyof ElectricalRatings, label: string, max = 1_000_000): RatingField => ({ key, label, min: 0.000001, max });
const zero = (key: keyof ElectricalRatings, label: string, max = 1_000_000): RatingField => ({ key, label, min: 0, max });
export const ratingFields: Record<"battery" | "inverter" | "controller" | "panel", RatingField[]> = {
  battery: [positive("minimumVoltage", "Minimum operating V per battery"), zero("continuousDischargeA", "Continuous operating A per battery"), zero("continuousDischargeW", "Continuous operating W per battery"), zero("startupDischargeA", "Startup A per battery"), zero("startupDischargeW", "Startup W per battery"), positive("startupDischargeSeconds", "Startup duration seconds"), zero("maxChargeA", "Maximum charge A per battery"), zero("maxChargeW", "Maximum charge W per battery"), positive("chargeVoltage", "Charge V per battery"), positive("floatVoltage", "Float V per battery"), { ...positive("maxSeries", "Approved maximum in series", 1000), integer: true }, { ...positive("maxParallel", "Approved maximum in parallel", 1000), integer: true }],
  inverter: [positive("outputVoltage", "AC output V", 1000), positive("outputFrequencyHz", "AC output Hz", 1000), positive("efficiency", "Operating efficiency (0–1)", 1), zero("noLoadWatts", "Energized unloaded W"), zero("continuousVA", "Continuous VA"), zero("surgeW", "Startup W"), zero("surgeVA", "Startup VA"), positive("surgeSeconds", "Startup duration seconds"), positive("chargeVoltage", "Configured charge V"), positive("floatVoltage", "Configured float V"), positive("maxPvVoltage", "Maximum PV open-circuit V"), positive("minMpptVoltage", "Minimum MPPT V"), positive("maxMpptVoltage", "Maximum MPPT V"), zero("maxPvInputA", "Maximum PV short-circuit A per input"), { ...positive("mpptInputs", "Independent MPPT inputs", 1000), integer: true }, zero("maxPvWatts", "Maximum PV input W")],
  controller: [positive("chargeVoltage", "Configured charge V"), positive("floatVoltage", "Configured float V"), positive("maxPvVoltage", "Maximum PV open-circuit V"), positive("minMpptVoltage", "Minimum MPPT V"), positive("maxMpptVoltage", "Maximum MPPT V"), zero("mpptBatteryHeadroomV", "MPPT minimum above battery V"), zero("maxPvInputA", "Maximum PV short-circuit A per input"), { ...positive("mpptInputs", "Independent MPPT inputs", 1000), integer: true }, zero("maxPvWatts", "Maximum PV input W")],
  panel: [positive("voc", "Module Voc at 25°C (V)"), positive("vmp", "Module Vmp at 25°C (V)"), positive("isc", "Module Isc at 25°C (A)"), { key: "vocTemperatureCoefficient", label: "Voc coefficient (%/°C)", min: -5, max: 5 }, { key: "vmpTemperatureCoefficient", label: "Vmp coefficient (%/°C)", min: -5, max: 5 }, { key: "iscTemperatureCoefficient", label: "Isc coefficient (%/°C)", min: -5, max: 5 }],
};
export const loadAdvancedFields = [
  { key: "powerFactor", label: "Running power factor", min: 0.01, max: 1 },
  { key: "startupVA", label: "Startup VA each", min: 0, max: 1_000_000 },
  { key: "startupSeconds", label: "Startup seconds", min: 0, max: 3600 },
  { key: "frequencyHz", label: "AC frequency Hz", min: 1, max: 1000 },
  { key: "voltageMin", label: "Minimum supply V", min: 1, max: 1000 },
  { key: "voltageMax", label: "Maximum supply V", min: 1, max: 1000 },
] as const;
