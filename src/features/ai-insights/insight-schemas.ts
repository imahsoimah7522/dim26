// ===========================================
// DataInsight Mini — AI Insight Zod Schemas
// ===========================================
// Validates input (request) and output (AI response).

import { z } from "zod/v4";

// ── Request Schemas ─────────────────────────────

export const businessTypeSchema = z.enum([
  "retail",
  "fnb",
  "services",
  "wholesale",
  "other",
]);

const kpiSummarySchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.null()]),
  formattedValue: z.string(),
  available: z.boolean(),
});

const trendSummarySchema = z.object({
  period: z.string().min(1),
  revenue: z.number(),
  quantity: z.number(),
  transactionCount: z.number().int().min(0),
});

const rankedItemSummarySchema = z.object({
  name: z.string().min(1),
  revenue: z.number(),
  percentage: z.number().min(0).max(1),
});

const qualityFindingSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
  severity: z.string().min(1),
});

export const insightRequestSchema = z.object({
  businessType: businessTypeSchema,
  kpis: z.array(kpiSummarySchema).min(1).max(20),
  monthlyTrend: z.array(trendSummarySchema).max(60),
  topProducts: z.array(rankedItemSummarySchema).max(20),
  bottomProducts: z.array(rankedItemSummarySchema).max(10),
  revenueByCategory: z.array(rankedItemSummarySchema).max(30),
  qualityFindings: z.array(qualityFindingSchema).max(20),
  rowCount: z.number().int().min(0),
  language: z.enum(["id", "en"]).default("id"),
  userConsent: z.literal(true, {
    message: "Persetujuan pengguna diperlukan untuk mengirim data ke AI.",
  }),
});

export type InsightRequestInput = z.infer<typeof insightRequestSchema>;

// ── AI Response Schemas ─────────────────────────

const importanceLevelSchema = z.enum(["high", "medium", "low"]);

const keyFindingSchema = z.object({
  title: z.string().min(1).max(200),
  observation: z.string().min(1).max(500),
  evidence: z.string().min(1).max(500),
  importance: importanceLevelSchema,
});

const businessRiskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  severity: importanceLevelSchema,
  suggestedAction: z.string().min(1).max(500),
});

const recommendationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  priority: importanceLevelSchema,
  expectedImpact: z.string().min(1).max(500),
});

const limitationSchema = z.object({
  description: z.string().min(1).max(500),
});

export const insightResponseSchema = z.object({
  executiveSummary: z.string().min(1).max(2000),
  keyFindings: z.array(keyFindingSchema).min(1).max(10),
  businessRisks: z.array(businessRiskSchema).max(10),
  recommendations: z.array(recommendationSchema).max(10),
  limitations: z.array(limitationSchema).max(10),
});

export type InsightResponseOutput = z.infer<typeof insightResponseSchema>;
