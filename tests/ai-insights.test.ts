// ===========================================
// DataInsight Mini — AI Insights Tests
// ===========================================
// Tests for schemas, summary builder, and edge cases.

import { describe, it, expect } from "vitest";
import { insightRequestSchema, insightResponseSchema } from "@/features/ai-insights/insight-schemas";
import { buildInsightPayload } from "@/features/ai-insights/summary-builder";
import type { AnalyticsResult } from "@/features/analytics/analytics-types";
import type { QualityIssue } from "@/features/data-import/import-types";

// ── Helpers ─────────────────────────────────────

function makeAnalyticsResult(
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
      {
        label: "Rata-rata per Transaksi",
        value: 50000,
        formattedValue: "Rp50.000",
        available: true,
      },
      {
        label: "Total Kuantitas",
        value: null,
        formattedValue: "—",
        available: false,
        unavailableReason: "Kolom kuantitas belum dipetakan.",
      },
    ],
    monthlyTrend: [
      { month: "2024-01", monthLabel: "Jan 2024", revenue: 2000000, quantity: 40, transactionCount: 45 },
      { month: "2024-02", monthLabel: "Feb 2024", revenue: 3000000, quantity: 60, transactionCount: 55 },
    ],
    dailyTrend: [],
    topProducts: [
      { name: "Nasi Goreng", revenue: 2500000, quantity: 50, transactionCount: 50, percentage: 0.5 },
      { name: "Mie Ayam", revenue: 1500000, quantity: 30, transactionCount: 30, percentage: 0.3 },
    ],
    bottomProducts: [
      { name: "Es Teh", revenue: 500000, quantity: 100, transactionCount: 100, percentage: 0.1 },
    ],
    revenueByCategory: [
      { name: "Makanan", revenue: 4000000, quantity: 80, transactionCount: 80, percentage: 0.8 },
      { name: "Minuman", revenue: 1000000, quantity: 100, transactionCount: 100, percentage: 0.2 },
    ],
    revenueByBranch: [],
    mapping: { revenue: "total", product: "menu" },
    rowCount: 100,
    availability: {
      revenue: true,
      quantity: false,
      timeSeries: true,
      productRanking: true,
      categoryBreakdown: true,
      branchBreakdown: false,
    },
    ...overrides,
  };
}

const sampleQualityIssues: QualityIssue[] = [
  {
    type: "missing_values",
    severity: "warning",
    message: "3 nilai kosong ditemukan di kolom 'total'",
    affectedCount: 3,
  },
];

// ── Request Schema Tests ────────────────────────

describe("insightRequestSchema", () => {
  it("validates a valid request", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "fnb", sampleQualityIssues, true);
    const parsed = insightRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("rejects request without consent", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "fnb", [], false);
    const parsed = insightRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("rejects empty KPIs", () => {
    const payload = {
      businessType: "retail",
      kpis: [],
      monthlyTrend: [],
      topProducts: [],
      bottomProducts: [],
      revenueByCategory: [],
      qualityFindings: [],
      rowCount: 0,
      language: "id",
      userConsent: true,
    };
    const parsed = insightRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid business type", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "fnb", [], true);
    const modified = { ...payload, businessType: "invalid_type" };
    const parsed = insightRequestSchema.safeParse(modified);
    expect(parsed.success).toBe(false);
  });

  it("validates all business types", () => {
    const types = ["retail", "fnb", "services", "wholesale", "other"] as const;
    for (const t of types) {
      const result = makeAnalyticsResult();
      const payload = buildInsightPayload(result, t, [], true);
      const parsed = insightRequestSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    }
  });
});

// ── Response Schema Tests ───────────────────────

describe("insightResponseSchema", () => {
  it("validates a valid full response", () => {
    const response = {
      executiveSummary: "Bisnis menunjukkan pertumbuhan positif.",
      keyFindings: [
        {
          title: "Pertumbuhan Revenue",
          observation: "Revenue naik 50% dari Jan ke Feb.",
          evidence: "Jan: Rp2.000.000, Feb: Rp3.000.000",
          importance: "high",
        },
      ],
      businessRisks: [
        {
          title: "Konsentrasi Produk",
          description: "50% revenue dari satu produk.",
          severity: "medium",
          suggestedAction: "Diversifikasi menu.",
        },
      ],
      recommendations: [
        {
          title: "Promosi Minuman",
          description: "Tingkatkan penjualan minuman.",
          priority: "medium",
          expectedImpact: "Peningkatan revenue 10-15%.",
        },
      ],
      limitations: [
        { description: "Data kuantitas tidak tersedia." },
      ],
    };
    const parsed = insightResponseSchema.safeParse(response);
    expect(parsed.success).toBe(true);
  });

  it("rejects response without executiveSummary", () => {
    const response = {
      keyFindings: [],
      businessRisks: [],
      recommendations: [],
      limitations: [],
    };
    const parsed = insightResponseSchema.safeParse(response);
    expect(parsed.success).toBe(false);
  });

  it("rejects response with empty keyFindings", () => {
    const response = {
      executiveSummary: "Test.",
      keyFindings: [],
      businessRisks: [],
      recommendations: [],
      limitations: [],
    };
    const parsed = insightResponseSchema.safeParse(response);
    expect(parsed.success).toBe(false);
  });

  it("rejects response with invalid importance level", () => {
    const response = {
      executiveSummary: "Test.",
      keyFindings: [
        {
          title: "Test",
          observation: "Test observation",
          evidence: "Test evidence",
          importance: "critical", // invalid
        },
      ],
      businessRisks: [],
      recommendations: [],
      limitations: [],
    };
    const parsed = insightResponseSchema.safeParse(response);
    expect(parsed.success).toBe(false);
  });

  it("validates response with only required fields", () => {
    const response = {
      executiveSummary: "Ringkasan bisnis.",
      keyFindings: [
        {
          title: "Temuan 1",
          observation: "Observasi temuan",
          evidence: "Bukti temuan",
          importance: "low",
        },
      ],
      businessRisks: [],
      recommendations: [],
      limitations: [],
    };
    const parsed = insightResponseSchema.safeParse(response);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid JSON structure", () => {
    const parsed = insightResponseSchema.safeParse("not an object");
    expect(parsed.success).toBe(false);
  });

  it("rejects null", () => {
    const parsed = insightResponseSchema.safeParse(null);
    expect(parsed.success).toBe(false);
  });
});

// ── Summary Builder Tests ───────────────────────

describe("buildInsightPayload", () => {
  it("builds payload from full analytics result", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "fnb", sampleQualityIssues, true);

    expect(payload.businessType).toBe("fnb");
    expect(payload.rowCount).toBe(100);
    expect(payload.language).toBe("id");
    expect(payload.userConsent).toBe(true);
    expect(payload.kpis).toHaveLength(4);
    expect(payload.monthlyTrend).toHaveLength(2);
    expect(payload.topProducts).toHaveLength(2);
    expect(payload.bottomProducts).toHaveLength(1);
    expect(payload.revenueByCategory).toHaveLength(2);
    expect(payload.qualityFindings).toHaveLength(1);
  });

  it("builds payload with empty analytics (no trends/products)", () => {
    const result = makeAnalyticsResult({
      monthlyTrend: [],
      topProducts: [],
      bottomProducts: [],
      revenueByCategory: [],
    });
    const payload = buildInsightPayload(result, "retail", [], true);

    expect(payload.monthlyTrend).toHaveLength(0);
    expect(payload.topProducts).toHaveLength(0);
    expect(payload.bottomProducts).toHaveLength(0);
    expect(payload.revenueByCategory).toHaveLength(0);
    expect(payload.qualityFindings).toHaveLength(0);
  });

  it("does not include raw row data", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "retail", [], true);
    const payloadStr = JSON.stringify(payload);

    // Should not contain ParsedRow or raw column data
    expect(payloadStr).not.toContain("mapping");
    expect(payloadStr).not.toContain("availability");
    expect(payloadStr).not.toContain("dailyTrend");
  });

  it("preserves KPI availability info", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "retail", [], true);

    const unavailable = payload.kpis.find((k) => !k.available);
    expect(unavailable).toBeDefined();
    expect(unavailable?.label).toBe("Total Kuantitas");
  });

  it("sets consent to false when not given", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "retail", [], false);
    expect(payload.userConsent).toBe(false);
  });

  it("maps quality issues correctly", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "retail", sampleQualityIssues, true);

    expect(payload.qualityFindings[0].type).toBe("missing_values");
    expect(payload.qualityFindings[0].severity).toBe("warning");
    expect(payload.qualityFindings[0].message).toContain("3 nilai kosong");
  });

  it("maps product percentages correctly", () => {
    const result = makeAnalyticsResult();
    const payload = buildInsightPayload(result, "retail", [], true);

    expect(payload.topProducts[0].percentage).toBe(0.5);
    expect(payload.topProducts[1].percentage).toBe(0.3);
  });
});
