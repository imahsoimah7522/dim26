// ===========================================
// DataInsight Mini — Chart Data Builder
// ===========================================
// Transforms AnalyticsResult into Recharts-ready data.

import type { AnalyticsResult, ChartData } from "./analytics-types";

/**
 * Build chart-ready data from analytics result.
 */
export function buildChartData(result: AnalyticsResult): ChartData {
  // Sales trend: prefer monthly, fall back to daily
  const salesTrend =
    result.monthlyTrend.length > 0
      ? result.monthlyTrend.map((m) => ({
          label: m.monthLabel,
          revenue: m.revenue,
          quantity: m.quantity,
        }))
      : result.dailyTrend.map((d) => ({
          label: d.date,
          revenue: d.revenue,
          quantity: d.quantity,
        }));

  // Product ranking (top 10)
  const productRanking = result.topProducts.map((p) => ({
    name: p.name,
    value: p.revenue,
  }));

  // Category pie
  const categoryPie = result.revenueByCategory.map((c) => ({
    name: c.name,
    value: c.revenue,
  }));

  // Branch pie
  const branchPie = result.revenueByBranch.map((b) => ({
    name: b.name,
    value: b.revenue,
  }));

  return { salesTrend, productRanking, categoryPie, branchPie };
}
