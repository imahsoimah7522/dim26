// ===========================================
// DataInsight Mini — Analysis Type Definitions
// ===========================================

/**
 * Statistik ringkasan per kolom metric
 */
export interface SummaryStats {
  total: number | null;
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  standardDeviation: number | null;
  count: number;
}

/**
 * Data tren waktu
 */
export interface TrendData {
  period: string;
  value: number;
  previousValue: number | null;
  growthRate: number | null;
}

/**
 * Data ranking per kategori
 */
export interface RankingData {
  category: string;
  value: number;
  percentage: number;
}

/**
 * Data distribusi
 */
export interface DistributionData {
  category: string;
  count: number;
  percentage: number;
}

/**
 * Data korelasi antara dua metric
 */
export interface CorrelationData {
  metricA: string;
  metricB: string;
  coefficient: number;
}

/**
 * Data outlier
 */
export interface OutlierData {
  rowIndex: number;
  column: string;
  value: number;
  reason: string;
}

/**
 * Hasil analisis lengkap
 */
export interface AnalysisResult {
  summary: Record<string, SummaryStats>;
  trends: TrendData[] | null;
  rankings: RankingData[] | null;
  distributions: DistributionData[] | null;
  correlations: CorrelationData[] | null;
  outliers: OutlierData[] | null;
}

/**
 * AI Insight dari Gemini
 */
export interface AiInsight {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

/**
 * Status report
 */
export type ReportStatus = "draft" | "generating" | "completed" | "failed";

/**
 * Tipe pembayaran
 */
export type PaymentType = "single_report" | "business_pack";

/**
 * Status pembayaran
 */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "expired";
