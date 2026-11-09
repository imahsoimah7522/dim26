// ===========================================
// DataInsight Mini — Summary Builder
// ===========================================
// Transforms AnalyticsResult into a safe, minimal
// summary for the AI — no raw data is sent.

import type { AnalyticsResult } from "@/features/analytics/analytics-types";
import type { QualityIssue } from "@/features/data-import/import-types";
import type {
  InsightRequestPayload,
  BusinessType,
  KPISummary,
  TrendSummary,
  RankedItemSummary,
  QualityFinding,
} from "./insight-types";

/**
 * Build a safe summary payload from analytics results.
 * Only aggregated / statistical data is included — no raw rows.
 */
export function buildInsightPayload(
  result: AnalyticsResult,
  businessType: BusinessType,
  qualityIssues: QualityIssue[],
  userConsent: boolean,
): InsightRequestPayload {
  // KPIs — strip raw value, send label + formatted only
  const kpis: KPISummary[] = result.kpis.map((k) => ({
    label: k.label,
    value: k.value,
    formattedValue: k.formattedValue,
    available: k.available,
  }));

  // Monthly trend — aggregated, no raw rows
  const monthlyTrend: TrendSummary[] = result.monthlyTrend.map((m) => ({
    period: m.monthLabel,
    revenue: m.revenue,
    quantity: m.quantity,
    transactionCount: m.transactionCount,
  }));

  // Products — only name, revenue, percentage
  const topProducts: RankedItemSummary[] = result.topProducts.map((p) => ({
    name: p.name,
    revenue: p.revenue,
    percentage: p.percentage,
  }));

  const bottomProducts: RankedItemSummary[] = result.bottomProducts.map((p) => ({
    name: p.name,
    revenue: p.revenue,
    percentage: p.percentage,
  }));

  // Category breakdown
  const revenueByCategory: RankedItemSummary[] = result.revenueByCategory.map((c) => ({
    name: c.name,
    revenue: c.revenue,
    percentage: c.percentage,
  }));

  // Quality findings
  const qualityFindings: QualityFinding[] = qualityIssues.map((q) => ({
    type: q.type,
    message: q.message,
    severity: q.severity,
  }));

  return {
    businessType,
    kpis,
    monthlyTrend,
    topProducts,
    bottomProducts,
    revenueByCategory,
    qualityFindings,
    rowCount: result.rowCount,
    language: "id",
    userConsent,
  };
}
