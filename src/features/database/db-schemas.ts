// ===========================================
// Database Zod Schemas — DataInsight Mini
// ===========================================

import { z } from "zod/v4";

/** Validated analysis summary structure */
export const AnalysisSummarySchema = z.object({
  totalRevenue: z.number().optional(),
  totalTransactions: z.number().optional(),
  averageTransaction: z.number().optional(),
  uniqueProducts: z.number().optional(),
  uniqueCategories: z.number().optional(),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  topProducts: z
    .array(
      z.object({
        name: z.string(),
        revenue: z.number(),
        quantity: z.number(),
      })
    )
    .optional(),
  topCategories: z
    .array(
      z.object({
        name: z.string(),
        revenue: z.number(),
      })
    )
    .optional(),
  monthlyTrend: z
    .array(
      z.object({
        month: z.string(),
        revenue: z.number(),
        transactions: z.number(),
      })
    )
    .optional(),
});

/** Input for saving an analysis */
export const SaveAnalysisSchema = z.object({
  fileName: z.string().min(1, "Nama file wajib diisi."),
  fileSize: z.number().positive("Ukuran file harus positif."),
  rowCount: z.number().positive("Jumlah baris harus positif."),
  columnCount: z.number().positive("Jumlah kolom harus positif."),
  columnMapping: z.record(z.string(), z.string()).nullable().optional(),
  summary: AnalysisSummarySchema,
  hasAiInsights: z.boolean().optional(),
  aiInsights: z.unknown().optional(),
});

/** Input for creating a report order */
export const CreateOrderSchema = z.object({
  analysisId: z.string().uuid("Analysis ID tidak valid."),
  tier: z.enum(["free_demo", "paid_report", "business_pack"]),
  price: z.number().min(0, "Harga tidak boleh negatif."),
});

/** Input for saving a generated report reference */
export const SaveReportSchema = z.object({
  analysisId: z.string().uuid("Analysis ID tidak valid."),
  orderId: z.string().uuid("Order ID tidak valid.").optional(),
  storagePath: z.string().min(1, "Storage path wajib diisi."),
  isDemo: z.boolean(),
});

export type SaveAnalysisInput = z.infer<typeof SaveAnalysisSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type SaveReportInput = z.infer<typeof SaveReportSchema>;
