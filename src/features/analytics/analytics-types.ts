// ===========================================
// DataInsight Mini — Analytics Types
// ===========================================


/** Column mapping roles */
export type MappingRole =
  | "date"
  | "product"
  | "revenue"
  | "quantity"
  | "category"
  | "branch";

/** User-defined column mapping */
export type ColumnMapping = Partial<Record<MappingRole, string>>;

/** Basic descriptive statistics */
export interface DescriptiveStats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

/** Frequency distribution entry */
export interface FrequencyEntry {
  value: string;
  count: number;
  percentage: number;
}

/** A KPI that may be unavailable */
export interface KPIResult {
  label: string;
  value: string | number | null;
  formattedValue: string;
  available: boolean;
  unavailableReason?: string;
}

/** Monthly revenue entry */
export interface MonthlyEntry {
  month: string;       // "2024-01" format
  monthLabel: string;  // "Jan 2024"
  revenue: number;
  quantity: number;
  transactionCount: number;
}

/** Daily trend entry */
export interface DailyEntry {
  date: string;
  revenue: number;
  quantity: number;
  transactionCount: number;
}

/** Ranked item (product, category, branch) */
export interface RankedItem {
  name: string;
  revenue: number;
  quantity: number;
  transactionCount: number;
  percentage: number;
}

/** Full analytics result */
export interface AnalyticsResult {
  kpis: KPIResult[];
  monthlyTrend: MonthlyEntry[];
  dailyTrend: DailyEntry[];
  topProducts: RankedItem[];
  bottomProducts: RankedItem[];
  revenueByCategory: RankedItem[];
  revenueByBranch: RankedItem[];
  mapping: ColumnMapping;
  rowCount: number;
  /** Which analytics sections are available */
  availability: {
    revenue: boolean;
    quantity: boolean;
    timeSeries: boolean;
    productRanking: boolean;
    categoryBreakdown: boolean;
    branchBreakdown: boolean;
  };
}

/** Chart-ready data for Recharts */
export interface ChartData {
  salesTrend: { label: string; revenue: number; quantity: number }[];
  productRanking: { name: string; value: number }[];
  categoryPie: { name: string; value: number }[];
  branchPie: { name: string; value: number }[];
}
