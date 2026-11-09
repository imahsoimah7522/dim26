// ===========================================
// DataInsight Mini — Sales Analytics Tests
// ===========================================

import { describe, it, expect } from "vitest";
import { runAnalytics } from "@/features/analytics/sales-analytics";
import { buildChartData } from "@/features/analytics/chart-data-builder";
import type { ParsedRow } from "@/features/data-import/import-types";
import type { ColumnMapping } from "@/features/analytics/analytics-types";

// ── Test Data ─────────────────────────────────

const salesRows: ParsedRow[] = [
  { Tanggal: "2024-01-05", Produk: "Kopi", Kategori: "Minuman", Cabang: "Jakarta", Jumlah: 3, Total: 54000 },
  { Tanggal: "2024-01-10", Produk: "Roti", Kategori: "Makanan", Cabang: "Bandung", Jumlah: 5, Total: 75000 },
  { Tanggal: "2024-01-15", Produk: "Kopi", Kategori: "Minuman", Cabang: "Jakarta", Jumlah: 2, Total: 36000 },
  { Tanggal: "2024-02-01", Produk: "Teh", Kategori: "Minuman", Cabang: "Bandung", Jumlah: 4, Total: 32000 },
  { Tanggal: "2024-02-10", Produk: "Roti", Kategori: "Makanan", Cabang: "Jakarta", Jumlah: 3, Total: 45000 },
];

const fullMapping: ColumnMapping = {
  date: "Tanggal",
  product: "Produk",
  revenue: "Total",
  quantity: "Jumlah",
  category: "Kategori",
  branch: "Cabang",
};

// ── Tests ─────────────────────────────────────

describe("runAnalytics — full mapping", () => {
  const result = runAnalytics(salesRows, fullMapping);

  it("computes correct total revenue", () => {
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    expect(revKpi).toBeDefined();
    expect(revKpi!.available).toBe(true);
    // 54000 + 75000 + 36000 + 32000 + 45000 = 242000
    expect(revKpi!.value).toBe(242000);
  });

  it("computes correct transaction count", () => {
    const txKpi = result.kpis.find((k) => k.label === "Jumlah Transaksi");
    expect(txKpi!.value).toBe(5);
  });

  it("computes correct average transaction", () => {
    const avgKpi = result.kpis.find((k) => k.label === "Rata-rata per Transaksi");
    expect(avgKpi!.available).toBe(true);
    // 242000 / 5 = 48400
    expect(avgKpi!.value).toBe(48400);
  });

  it("computes correct total quantity", () => {
    const qtyKpi = result.kpis.find((k) => k.label === "Total Kuantitas");
    // 3 + 5 + 2 + 4 + 3 = 17
    expect(qtyKpi!.value).toBe(17);
  });

  it("ranks products correctly", () => {
    expect(result.topProducts[0].name).toBe("Roti");
    // Roti: 75000 + 45000 = 120000
    expect(result.topProducts[0].revenue).toBe(120000);
    // Kopi: 54000 + 36000 = 90000
    expect(result.topProducts[1].name).toBe("Kopi");
    expect(result.topProducts[1].revenue).toBe(90000);
  });

  it("builds category breakdown", () => {
    expect(result.revenueByCategory).toHaveLength(2);
    const minuman = result.revenueByCategory.find((c) => c.name === "Minuman");
    // 54000 + 36000 + 32000 = 122000
    expect(minuman!.revenue).toBe(122000);
  });

  it("builds branch breakdown", () => {
    expect(result.revenueByBranch).toHaveLength(2);
    const jakarta = result.revenueByBranch.find((b) => b.name === "Jakarta");
    // 54000 + 36000 + 45000 = 135000
    expect(jakarta!.revenue).toBe(135000);
  });

  it("builds monthly trend", () => {
    expect(result.monthlyTrend).toHaveLength(2);
    expect(result.monthlyTrend[0].month).toBe("2024-01");
    // Jan: 54000 + 75000 + 36000 = 165000
    expect(result.monthlyTrend[0].revenue).toBe(165000);
  });

  it("reports all sections available", () => {
    expect(result.availability.revenue).toBe(true);
    expect(result.availability.quantity).toBe(true);
    expect(result.availability.timeSeries).toBe(true);
    expect(result.availability.productRanking).toBe(true);
    expect(result.availability.categoryBreakdown).toBe(true);
    expect(result.availability.branchBreakdown).toBe(true);
  });
});

describe("runAnalytics — partial mapping", () => {
  it("disables revenue KPIs when revenue column missing", () => {
    const result = runAnalytics(salesRows, { product: "Produk" });
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    expect(revKpi!.available).toBe(false);
    expect(revKpi!.unavailableReason).toBeDefined();
    expect(result.availability.revenue).toBe(false);
  });

  it("still counts transactions with no revenue column", () => {
    const result = runAnalytics(salesRows, {});
    const txKpi = result.kpis.find((k) => k.label === "Jumlah Transaksi");
    expect(txKpi!.value).toBe(5);
    expect(txKpi!.available).toBe(true);
  });

  it("disables time series when date column missing", () => {
    const result = runAnalytics(salesRows, { revenue: "Total" });
    expect(result.monthlyTrend).toHaveLength(0);
    expect(result.availability.timeSeries).toBe(false);
  });

  it("disables product ranking when product column missing", () => {
    const result = runAnalytics(salesRows, { revenue: "Total" });
    expect(result.topProducts).toHaveLength(0);
    expect(result.availability.productRanking).toBe(false);
  });
});

describe("runAnalytics — edge cases", () => {
  it("handles empty data", () => {
    const result = runAnalytics([], fullMapping);
    expect(result.rowCount).toBe(0);
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    expect(revKpi!.value).toBe(0);
  });

  it("handles rows with missing values", () => {
    const rows: ParsedRow[] = [
      { Tanggal: "2024-01-01", Produk: "Kopi", Total: 50000, Jumlah: 2, Kategori: "Minuman", Cabang: "JKT" },
      { Tanggal: null, Produk: "Teh", Total: null, Jumlah: null, Kategori: null, Cabang: null },
      { Tanggal: "2024-01-03", Produk: null, Total: 30000, Jumlah: 1, Kategori: "Makanan", Cabang: "BDG" },
    ];
    const result = runAnalytics(rows, fullMapping);
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    // Only 50000 + 30000 from extractable values
    expect(revKpi!.value).toBe(80000);
    expect(result.rowCount).toBe(3);
  });

  it("handles negative revenue values", () => {
    const rows: ParsedRow[] = [
      { Total: 100000 },
      { Total: -20000 },  // refund
      { Total: 50000 },
    ];
    const result = runAnalytics(rows, { revenue: "Total" });
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    expect(revKpi!.value).toBe(130000);
  });

  it("handles duplicate transactions", () => {
    const rows: ParsedRow[] = [
      { Produk: "Kopi", Total: 18000 },
      { Produk: "Kopi", Total: 18000 },
      { Produk: "Kopi", Total: 18000 },
    ];
    const result = runAnalytics(rows, { product: "Produk", revenue: "Total" });
    expect(result.topProducts[0].revenue).toBe(54000);
    expect(result.topProducts[0].transactionCount).toBe(3);
  });

  it("handles invalid dates gracefully", () => {
    const rows: ParsedRow[] = [
      { Tanggal: "not-a-date", Total: 10000 },
      { Tanggal: "2024-01-01", Total: 20000 },
    ];
    const result = runAnalytics(rows, { date: "Tanggal", revenue: "Total" });
    // Only 1 valid date
    expect(result.monthlyTrend).toHaveLength(1);
    expect(result.monthlyTrend[0].revenue).toBe(20000);
  });

  it("handles zero revenue", () => {
    const rows: ParsedRow[] = [
      { Total: 0 },
      { Total: 0 },
    ];
    const result = runAnalytics(rows, { revenue: "Total" });
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    expect(revKpi!.value).toBe(0);
  });

  it("handles large numeric values", () => {
    const rows: ParsedRow[] = [
      { Total: 1_000_000_000 },
      { Total: 2_500_000_000 },
    ];
    const result = runAnalytics(rows, { revenue: "Total" });
    const revKpi = result.kpis.find((k) => k.label === "Total Pendapatan");
    expect(revKpi!.value).toBe(3_500_000_000);
  });
});

describe("buildChartData", () => {
  it("builds chart data from analytics result", () => {
    const result = runAnalytics(salesRows, fullMapping);
    const chartData = buildChartData(result);

    expect(chartData.salesTrend).toHaveLength(2);
    expect(chartData.productRanking.length).toBeGreaterThan(0);
    expect(chartData.categoryPie).toHaveLength(2);
    expect(chartData.branchPie).toHaveLength(2);
  });

  it("uses monthly labels for sales trend", () => {
    const result = runAnalytics(salesRows, fullMapping);
    const chartData = buildChartData(result);
    expect(chartData.salesTrend[0].label).toContain("Jan");
  });
});
