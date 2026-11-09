// ===========================================
// DataInsight Mini — Report Types
// ===========================================

import type { AnalyticsResult } from "@/features/analytics/analytics-types";
import type { InsightResponse } from "@/features/ai-insights/insight-types";
import type { QualityIssue } from "@/features/data-import/import-types";

/** Data needed to generate a PDF report */
export interface ReportData {
  /** Report title */
  title: string;
  /** Business name (optional) */
  businessName?: string;
  /** Business type label */
  businessType: string;
  /** File name of the dataset */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** Analytics result from Phase 4 */
  analytics: AnalyticsResult;
  /** AI insights from Phase 5 (optional) */
  insights?: InsightResponse;
  /** Data quality issues */
  qualityIssues: QualityIssue[];
  /** Whether this is a demo/free report */
  isDemo: boolean;
  /** Report generation timestamp */
  generatedAt: Date;
}

/** Report generation status */
export type ReportStep = "idle" | "generating" | "done" | "error";

export interface ReportState {
  step: ReportStep;
  error: string | null;
}
