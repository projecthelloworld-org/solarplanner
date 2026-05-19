export type CurrentType = "DC" | "AC";

export interface LoadItem {
  id: string;
  name: string;
  quantity: number;
  watts: number;
  hoursPerDay: number;
  currentType: CurrentType;
  voltage: number;
  surgeMultiplier: number;
  critical: boolean;
}

export interface Project {
  id: string;
  name: string;
  country: string;
  currency: string;
  systemVoltage: number;
  sunHours: number;
  autonomyDays: number;
  brandProfileId: string;
  loads: LoadItem[];
  updatedAt: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  reportFooter: string;
}

export interface Assumptions {
  dcDistributionEfficiency: number;
  hybridDcEfficiency: number;
  inverterEfficiency: number;
  batteryDepthOfDischarge: number;
  batteryReserveFactor: number;
  arrayDerateFactor: number;
  mpptSafetyFactor: number;
  inverterHeadroomFactor: number;
  installationRate: number;
  contingencyRate: number;
  currencyExchangeNotes: string;
  safetyDisclaimer: string;
}

export interface ProductCatalog {
  solarPanels: ProductItem[];
  batteries: ProductItem[];
  chargeControllers: ProductItem[];
  hybridInverters: ProductItem[];
  dcDistribution: ProductItem[];
  acDistribution: ProductItem[];
  cabling: ProductItem[];
  earthing: ProductItem[];
  monitoring: ProductItem[];
}

export interface ProductItem {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
  watts?: number;
  wattHours?: number;
  amps?: number;
  systemVoltage?: number;
}

export interface LoadCalculation {
  load: LoadItem;
  dailyWh: number;
  runningWatts: number;
  surgeWatts: number;
}

export interface SystemSizing {
  adjustedDailyWh: number;
  requiredBatteryWh: number;
  recommendedSolarArrayW: number;
  recommendedMpptCurrentA: number;
  recommendedInverterW: number;
}

export interface CalculationResult {
  loadRows: LoadCalculation[];
  totalDailyWh: number;
  peakLoadW: number;
  surgeLoadW: number;
  criticalDailyWh: number;
  dc: SystemSizing;
  hybrid: SystemSizing;
}

export interface RecommendationLine {
  category: string;
  recommendation: string;
  rationale: string;
}

export interface SystemRecommendation {
  id: "dc" | "hybrid";
  name: string;
  summary: string;
  lines: RecommendationLine[];
}

export interface CostLine {
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface CostEstimate {
  systemId: "dc" | "hybrid";
  lines: CostLine[];
  subtotal: number;
  installation: number;
  contingency: number;
  total: number;
}
