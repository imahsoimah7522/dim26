// ===========================================
// Manual Payment Adapter — DataInsight Mini
// ===========================================
// Adapter untuk pembayaran manual (transfer bank).
// Digunakan sebelum integrasi payment gateway.

import { createHmac } from "crypto";
import type { PaymentAdapter } from "../payment-adapter";
import type {
  OrderData,
  PaymentResult,
  VerificationResult,
} from "../payment-types";
import { VerifyPaymentSchema } from "../payment-schemas";

export class ManualPaymentAdapter implements PaymentAdapter {
  readonly name = "manual";

  async createPayment(order: OrderData): Promise<PaymentResult> {
    // Buat instruksi transfer bank
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    return {
      success: true,
      instructions: {
        method: "Bank Transfer",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "PT DataInsight Mini",
        amount: order.amount,
        orderReference: order.orderReference,
        expiresAt,
      },
    };
  }

  async verifyPayment(payload: unknown): Promise<VerificationResult> {
    const parsed = VerifyPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        orderId: "",
        status: "failed",
        error: "Data verifikasi tidak valid.",
      };
    }

    return {
      success: true,
      orderId: parsed.data.orderId,
      status: "paid",
    };
  }

  verifySignature(signature: string, body: string): boolean {
    const secret = process.env.PAYMENT_SECRET_KEY;
    if (!secret) return false;

    const expected = createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return signature === expected;
  }
}
