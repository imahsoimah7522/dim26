// ===========================================
// Payment Zod Schemas — DataInsight Mini
// ===========================================

import { z } from "zod/v4";

/** Input untuk membuat order — harga TIDAK dari client */
export const CreatePaymentOrderSchema = z.object({
  analysisId: z.string().uuid("Analysis ID tidak valid."),
  tier: z.enum(["paid_report", "business_pack"]),
});

/** Input untuk verifikasi manual oleh admin */
export const VerifyPaymentSchema = z.object({
  orderId: z.string().uuid("Order ID tidak valid."),
  notes: z.string().max(500).optional(),
});

/** Payload webhook dari payment gateway */
export const WebhookPayloadSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["paid", "failed", "expired"]),
  transactionId: z.string().optional(),
  amount: z.number().optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
