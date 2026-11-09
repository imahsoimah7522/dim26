// ===========================================
// DataInsight Mini — Sales Analytics Module
// ===========================================
// Business KPIs and rankings from mapped data.
// All results are deterministic — no AI.

import type { ParsedRow } from "../data-import/import-types";
import type {
  ColumnMapping,
  KPIResult,
  RankedItem,
  AnalyticsResult,
} from "./analytics-types";
import { sum, mean } from "./statistics";
import { groupBy } from "./aggregation";
import { aggregateByMonth, aggregateByDay } from "./date-analysis";
import { formatRupiah } from "@/lib/utils/format";

/**
 * Build a "not available" KPI.
 */
function unavailableKPI(label: string, reason: string): KPIResult {
  return {
    label,
    value: null,
    formattedValue: "—",
    available: false,
    unavailableReason: reason,
  };
}

/**
 * Build ranked items from grouped rows.
 */
function buildRanking(
  rows: ParsedRow[],
  groupColumn: string,
  revenueColumn?: string,
  quantityColumn?: string,
  limit?: number
): RankedItem[] {
  const groups = groupBy(rows, groupColumn);

  let totalRevenue = 0;
  const items: RankedItem[] = [];

  for (const [name, groupRows] of groups) {
    const rev = revenueColumn
      ? sum(groupRows.map((r) => r[revenueColumn]))
      : 0;
    const qty = quantityColumn
      ? sum(groupRows.map((r) => r[quantityColumn]))
      : 0;

    totalRevenue += rev;
    items.push({
      name,
      revenue: rev,
      quantity: qty,
      transactionCount: groupRows.length,
      percentage: 0, // computed after totaling
    });
  }

  // Compute percentages
  for (const item of items) {
    item.percentage = totalRevenue > 0 ? item.revenue / totalRevenue : 0;
  }

  // Sort by revenue descending
  items.sort((a, b) => b.revenue - a.revenue);

  return limit ? items.slice(0, limit) : items;
}

/**
 * Run the full sales analytics pipeline.
 *
 * Gracefully handles missing columns by disabling
 * the corresponding analytics section.
 */
export function runAnalytics(
  rows: ParsedRow[],
  mapping: ColumnMapping
): AnalyticsResult {
  const {
    date: dateCol,
    product: productCol,
    revenue: revenueCol,
    quantity: quantityCol,
    category: categoryCol,
    branch: branchCol,
  } = mapping;

  // Determine availability
  const hasRevenue = !!revenueCol;
  const hasQuantity = !!quantityCol;
  const hasDate = !!dateCol;
  const hasProduct = !!productCol;
  const hasCategory = !!categoryCol;
  const hasBranch = !!branchCol;

  const availability = {
    revenue: hasRevenue,
    quantity: hasQuantity,
    timeSeries: hasDate,
    productRanking: hasProduct,
    categoryBreakdown: hasCategory,
    branchBreakdown: hasBranch,
  };

  // ── KPIs ────────────────────────────────────
  const kpis: KPIResult[] = [];

  // Total Revenue
  if (hasRevenue) {
    const total = sum(rows.map((r) => r[revenueCol]));
    kpis.push({
      label: "Total Pendapatan",
      value: total,
      formattedValue: formatRupiah(total),
      available: true,
    });
  } else {
    kpis.push(unavailableKPI("Total Pendapatan", "Kolom pendapatan belum dipetakan."));
  }

  // Transaction Count
  kpis.push({
    label: "Jumlah Transaksi",
    value: rows.length,
    formattedValue: rows.length.toLocaleString("id-ID"),
    available: true,
  });

  // Average Transaction Value
  if (hasRevenue) {
    const avg = mean(rows.map((r) => r[revenueCol]));
    kpis.push({
      label: "Rata-rata per Transaksi",
      value: avg,
      formattedValue: formatRupiah(Math.round(avg)),
      available: true,
    });
  } else {
    kpis.push(unavailableKPI("Rata-rata per Transaksi", "Kolom pendapatan belum dipetakan."));
  }

  // Total Quantity
  if (hasQuantity) {
    const total = sum(rows.map((r) => r[quantityCol]));
    kpis.push({
      label: "Total Kuantitas",
      value: total,
      formattedValue: total.toLocaleString("id-ID"),
      available: true,
    });
  } else {
    kpis.push(unavailableKPI("Total Kuantitas", "Kolom kuantitas belum dipetakan."));
  }

  // ── Time Series ─────────────────────────────
  const monthlyTrend = hasDate
    ? aggregateByMonth(rows, dateCol, revenueCol, quantityCol)
    : [];

  const dailyTrend = hasDate
    ? aggregateByDay(rows, dateCol, revenueCol, quantityCol)
    : [];

  // ── Product Ranking ─────────────────────────
  const allProducts = hasProduct
    ? buildRanking(rows, productCol, revenueCol, quantityCol)
    : [];

  const topProducts = allProducts.slice(0, 10);
  const bottomProducts = hasProduct
    ? [...allProducts].sort((a, b) => a.revenue - b.revenue).slice(0, 5)
    : [];

  // ── Category Breakdown ──────────────────────
  const revenueByCategory = hasCategory
    ? buildRanking(rows, categoryCol, revenueCol, quantityCol)
    : [];

  // ── Branch Breakdown ────────────────────────
  const revenueByBranch = hasBranch
    ? buildRanking(rows, branchCol, revenueCol, quantityCol)
    : [];

  return {
    kpis,
    monthlyTrend,
    dailyTrend,
    topProducts,
    bottomProducts,
    revenueByCategory,
    revenueByBranch,
    mapping,
    rowCount: rows.length,
    availability,
  };
}
