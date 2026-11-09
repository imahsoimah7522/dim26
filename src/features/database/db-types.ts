// ===========================================
// Database Row Types — DataInsight Mini
// ===========================================
// TypeScript types matching Supabase table schemas.

/** profiles table row */
export interface ProfileRow {
  id: string;
  full_name: string | null;
  business_name: string | null;
  business_type: string | null;
  created_at: string;
  updated_at: string;
}

/** Summary data stored in analyses.summary JSONB */
export interface AnalysisSummary {
  totalRevenue?: number;
  totalTransactions?: number;
  averageTransaction?: number;
  uniqueProducts?: number;
  uniqueCategories?: number;
  dateRange?: { start: string; end: string };
  topProducts?: Array<{ name: string; revenue: number; quantity: number }>;
  topCategories?: Array<{ name: string; revenue: number }>;
  monthlyTrend?: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
}

/** analyses table row */
export interface AnalysisRow {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  row_count: number;
  column_count: number;
  column_mapping: Record<string, string> | null;
  summary: AnalysisSummary;
  has_ai_insights: boolean;
  ai_insights: unknown | null;
  created_at: string;
}

/** report_orders table row */
export interface ReportOrderRow {
  id: string;
  user_id: string;
  analysis_id: string;
  tier: "free_demo" | "paid_report" | "business_pack";
  price: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

/** payment_events table row */
export interface PaymentEventRow {
  id: string;
  order_id: string;
  event_type: "initiated" | "callback" | "webhook" | "verified" | "failed";
  payload: unknown;
  created_at: string;
}

/** generated_reports table row */
export interface GeneratedReportRow {
  id: string;
  user_id: string;
  analysis_id: string;
  order_id: string | null;
  storage_path: string;
  is_demo: boolean;
  created_at: string;
}
