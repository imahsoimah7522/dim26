// ===========================================
// DataInsight Mini — AI Insight Types
// ===========================================
// Types for Gemini AI business insight generation.

/** Importance level for findings and risks */
export type ImportanceLevel = "high" | "medium" | "low";

/** A single key finding from the analysis */
export interface KeyFinding {
  title: string;
  observation: string;
  evidence: string;
  importance: ImportanceLevel;
}

/** A business risk identified from the data */
export interface BusinessRisk {
  title: string;
  description: string;
  severity: ImportanceLevel;
  suggestedAction: string;
}

/** An actionable recommendation */
export interface Recommendation {
  title: string;
  description: string;
  priority: ImportanceLevel;
  expectedImpact: string;
}

/** A limitation of the analysis */
export interface Limitation {
  description: string;
}

/** Complete AI insight response */
export interface InsightResponse {
  executiveSummary: string;
  keyFindings: KeyFinding[];
  businessRisks: BusinessRisk[];
  recommendations: Recommendation[];
  limitations: Limitation[];
}

/** Business type for context */
export type BusinessType =
  | "retail"
  | "fnb"
  | "services"
  | "wholesale"
  | "other";

/** KPI summary sent to the API (no raw data) */
export interface KPISummary {
  label: string;
  value: string | number | null;
  formattedValue: string;
  available: boolean;
}

/** Aggregated trend data sent to the API */
export interface TrendSummary {
  period: string;
  revenue: number;
  quantity: number;
  transactionCount: number;
}

/** Ranked item summary sent to the API */
export interface RankedItemSummary {
  name: string;
  revenue: number;
  percentage: number;
}

/** Quality finding sent to the API */
export interface QualityFinding {
  type: string;
  message: string;
  severity: string;
}

/** The request payload for POST /api/ai/insights */
export interface InsightRequestPayload {
  businessType: BusinessType;
  kpis: KPISummary[];
  monthlyTrend: TrendSummary[];
  topProducts: RankedItemSummary[];
  bottomProducts: RankedItemSummary[];
  revenueByCategory: RankedItemSummary[];
  qualityFindings: QualityFinding[];
  rowCount: number;
  language: "id" | "en";
  userConsent: boolean;
}

/** State for the insight UI */
export type InsightStep = "idle" | "requesting-consent" | "loading" | "done" | "error";

export interface InsightState {
  step: InsightStep;
  response: InsightResponse | null;
  error: string | null;
}
