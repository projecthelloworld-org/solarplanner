export type CurrentType = "DC" | "AC";
export type EquipmentPlanMode = "generated" | "custom";
export type SystemOptionId = "dc" | "hybrid";

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
  usdExchangeRate: number;
  systemVoltage: number;
  sunHours: number;
  autonomyDays: number;
  brandProfileId: string;
  selectedSystem: SystemOptionId;
  equipmentDefaults: EquipmentDefaults;
  pricing: PricingSettings;
  equipmentPlanMode: EquipmentPlanMode;
  equipmentPlan?: EquipmentPlan;
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
  voltage?: number;
  ampHours?: number;
  maxArrayWatts?: number;
  supportedVoltages?: number[];
  maxSeries?: number;
  maxParallel?: number;
  continuousDischargeA?: number;
  inverterType?: "standalone" | "integrated";
  integratedMpptA?: number;
  maxPvWatts?: number;
  pvWattsByVoltage?: Record<string, number>;
  maxPvVoltage?: number;
  surgeVA?: number;
  specificationSources?: string[];
  priceEvidence?: PriceEvidence[];
  priceNotes?: string;
}

export interface PriceEvidence {
  url: string;
  checkedOn: string;
  country: string;
  currency: string;
  amount: number;
  unitsPerUsd: number;
  basis: "listed-product" | "comparable-class";
  taxDelivery: string;
}

export interface EquipmentDefaults {
  panelWatts: number;
  batteryVoltage: number;
  batteryAh: number;
  mpptAmpStep: number;
  inverterWattStep: number;
}

export interface PricingSettings {
  panelUnitUsd: number;
  batteryUnitUsd: number;
  controllerUnitUsd: number;
  hybridControllerUnitUsd?: number;
  inverterUnitUsd: number;
  dcDistributionUnitUsd: number;
  acDistributionUnitUsd: number;
  cablingUnitUsd: number;
  earthingUnitUsd: number;
  monitoringUnitUsd: number;
}

export interface SharedEquipmentPlan {
  panelProductId?: string;
  batteryProductId?: string;
  panelCount: number;
  panelWatts: number;
  batteryCount: number;
  batteryVoltage: number;
  batteryAh: number;
}

export interface DcEquipmentPlan {
  controllerProductId?: string;
  controllerCount: number;
  mpptAmps: number;
}

export interface HybridEquipmentPlan {
  controllerProductId?: string;
  inverterProductId?: string;
  controllerCount: number;
  mpptAmps: number;
  inverterCount: number;
  inverterWatts: number;
}

export interface EquipmentPlan {
  shared: SharedEquipmentPlan;
  dc: DcEquipmentPlan;
  hybrid: HybridEquipmentPlan;
  balance: BalanceEquipmentPlan;
}

export interface BalanceEquipmentPlan {
  dcDistributionCount: number;
  acDistributionCount: number;
  cablingCount: number;
  earthingCount: number;
  monitoringCount: number;
}

export interface EquipmentActuals {
  solarArrayW: number;
  batteryWh: number;
  dcMpptA: number;
  hybridMpptA: number;
  hybridInverterW: number;
}

export interface AdequacyCheck {
  label: string;
  actual: number;
  required: number;
  unit: string;
  passed: boolean;
  warning?: string;
}

export interface EquipmentEvaluation {
  systemId: SystemOptionId;
  status: "Preliminary checks met" | "Needs attention";
  checks: AdequacyCheck[];
  warnings: string[];
  notes: string[];
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
  acPeakLoadW: number;
  acSurgeLoadW: number;
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
  id: SystemOptionId;
  name: string;
  summary: string;
  lines: RecommendationLine[];
}

export interface CostLine {
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitCostUsd: number;
  total: number;
  totalUsd: number;
}

export interface CostEstimate {
  systemId: SystemOptionId;
  lines: CostLine[];
  subtotal: number;
  subtotalUsd: number;
  installation: number;
  installationUsd: number;
  contingency: number;
  contingencyUsd: number;
  total: number;
  totalUsd: number;
  currency: string;
  exchangeRate: number;
}
