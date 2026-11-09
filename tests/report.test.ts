// ===========================================
// DataInsight Mini — Report Tests
// ===========================================
// Tests for PDF styles helpers and report builder validation.

import { describe, it, expect } from "vitest";
import { pdfRupiah, pdfPercent, pdfDateID, pdfFileSize } from "@/features/report/pdf-styles";
import type { ReportData } from "@/features/report/report-types";
import type { AnalyticsResult } from "@/features/analytics/analytics-types";

// ── Helper ──────────────────────────────────────

function makeMinimalAnalytics(
  overrides: Partial<AnalyticsResult> = {}
): AnalyticsResult {
  return {
    kpis: [
      {
        label: "Total Pendapatan",
        value: 5000000,
        formattedValue: "Rp5.000.000",
        available: true,
      },
      {
        label: "Jumlah Transaksi",
        value: 100,
        formattedValue: "100",
        available: true,
      },
    ],
    monthlyTrend: [],
    dailyTrend: [],
    topProducts: [],
    bottomProducts: [],
    revenueByCategory: [],
    revenueByBranch: [],
    mapping: { revenue: "total" },
    rowCount: 100,
    availability: {
      revenue: true,
      quantity: false,
      timeSeries: false,
      productRanking: false,
      categoryBreakdown: false,
      branchBreakdown: false,
    },
    ...overrides,
  };
}

function makeReportData(
  overrides: Partial<ReportData> = {}
): ReportData {
  return {
    title: "Test Report",
    businessType: "Retail / Toko",
    fileName: "test-data.xlsx",
    fileSize: 102400,
    analytics: makeMinimalAnalytics(),
    qualityIssues: [],
    isDemo: true,
    generatedAt: new Date("2024-06-15T10:00:00Z"),
    ...overrides,
  };
}

// ── PDF Helpers Tests ───────────────────────────

describe("pdfRupiah", () => {
  it("formats positive values", () => {
    expect(pdfRupiah(1500000)).toBe("Rp1.500.000");
  });

  it("formats zero", () => {
    expect(pdfRupiah(0)).toBe("Rp0");
  });

  it("formats negative values", () => {
    expect(pdfRupiah(-500000)).toBe("-Rp500.000");
  });

  it("rounds decimals", () => {
    expect(pdfRupiah(1234.567)).toBe("Rp1.235");
  });

  it("handles large values", () => {
    expect(pdfRupiah(999999999)).toBe("Rp999.999.999");
  });
});

describe("pdfPercent", () => {
  it("formats decimal to percentage", () => {
    expect(pdfPercent(0.5)).toBe("50.0%");
  });

  it("formats zero", () => {
    expect(pdfPercent(0)).toBe("0.0%");
  });

  it("formats 100%", () => {
    expect(pdfPercent(1)).toBe("100.0%");
  });

  it("formats small percentage", () => {
    expect(pdfPercent(0.023)).toBe("2.3%");
  });
});

describe("pdfDateID", () => {
  it("formats date in Indonesian", () => {
    const date = new Date("2024-06-15T10:00:00Z");
    const result = pdfDateID(date);
    // Should contain "Juni" and "2024"
    expect(result).toContain("2024");
    // Should have day number
    expect(result).toMatch(/\d+/);
  });
});

describe("pdfFileSize", () => {
  it("formats KB", () => {
    expect(pdfFileSize(51200)).toBe("50 KB");
  });

  it("formats MB", () => {
    expect(pdfFileSize(2621440)).toBe("2.5 MB");
  });

  it("formats small file", () => {
    expect(pdfFileSize(1024)).toBe("1 KB");
  });
});

// ── ReportData Structure Tests ──────────────────

describe("ReportData structure", () => {
  it("creates valid report data with all fields", () => {
    const data = makeReportData();
    expect(data.title).toBe("Test Report");
    expect(data.isDemo).toBe(true);
    expect(data.analytics.rowCount).toBe(100);
    expect(data.qualityIssues).toHaveLength(0);
  });

  it("creates report data with insights", () => {
    const data = makeReportData({
      insights: {
        executiveSummary: "Bisnis berjalan baik.",
        keyFindings: [
          {
            title: "Revenue naik",
            observation: "Pertumbuhan positif",
            evidence: "Data menunjukkan peningkatan",
            importance: "high",
          },
        ],
        businessRisks: [],
        recommendations: [],
        limitations: [],
      },
    });
    expect(data.insights).toBeDefined();
    expect(data.insights?.keyFindings).toHaveLength(1);
  });

  it("creates report data without insights", () => {
    const data = makeReportData({ insights: undefined });
    expect(data.insights).toBeUndefined();
  });

  it("creates paid report without demo flag", () => {
    const data = makeReportData({ isDemo: false });
    expect(data.isDemo).toBe(false);
  });

  it("handles missing sections gracefully", () => {
    const data = makeReportData({
      analytics: makeMinimalAnalytics({
        topProducts: [],
        revenueByCategory: [],
        monthlyTrend: [],
      }),
    });
    expect(data.analytics.topProducts).toHaveLength(0);
    expect(data.analytics.revenueByCategory).toHaveLength(0);
    expect(data.analytics.monthlyTrend).toHaveLength(0);
  });

  it("handles analytics with full product data", () => {
    const data = makeReportData({
      analytics: makeMinimalAnalytics({
        topProducts: Array.from({ length: 10 }, (_, i) => ({
          name: `Product ${i + 1}`,
          revenue: (10 - i) * 100000,
          quantity: (10 - i) * 10,
          transactionCount: (10 - i) * 5,
          percentage: (10 - i) / 55,
        })),
        availability: {
          revenue: true,
          quantity: true,
          timeSeries: true,
          productRanking: true,
          categoryBreakdown: true,
          branchBreakdown: false,
        },
      }),
    });
    expect(data.analytics.topProducts).toHaveLength(10);
  });

  it("preserves quality issues", () => {
    const data = makeReportData({
      qualityIssues: [
        {
          type: "missing_values",
          severity: "warning",
          message: "5 nilai kosong",
          affectedCount: 5,
        },
        {
          type: "duplicate_rows",
          severity: "warning",
          message: "3 baris duplikat",
          affectedCount: 3,
        },
      ],
    });
    expect(data.qualityIssues).toHaveLength(2);
  });

  it("rejects empty analytics in report builder", async () => {
    const { generateReportPDF } = await import("@/features/report/report-builder");
    const data = makeReportData({
      analytics: makeMinimalAnalytics({ rowCount: 0 }),
    });
    await expect(generateReportPDF(data)).rejects.toThrow(
      "Tidak dapat membuat laporan dari analisis kosong."
    );
  });
});
