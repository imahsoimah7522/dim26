// ===========================================
// Payment Adapter Interface — DataInsight Mini
// ===========================================
// Abstract interface untuk payment providers.
// Memungkinkan swap antara manual, Midtrans, Xendit, dll.

import type {
  OrderData,
  PaymentResult,
  VerificationResult,
} from "./payment-types";

/** Interface yang harus diimplementasikan oleh setiap payment provider */
export interface PaymentAdapter {
  /** Nama provider */
  readonly name: string;

  /** Buat payment request — return instruksi atau redirect URL */
  createPayment(order: OrderData): Promise<PaymentResult>;

  /** Verifikasi pembayaran dari callback/webhook */
  verifyPayment(payload: unknown): Promise<VerificationResult>;

  /** Cek signature webhook — return true jika valid */
  verifySignature(signature: string, body: string): boolean;
}

/** Factory untuk mendapatkan adapter aktif */
export function getPaymentAdapter(): PaymentAdapter {
  // Untuk saat ini, gunakan manual adapter
  // Di masa depan: switch berdasarkan env var PAYMENT_PROVIDER
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ManualPaymentAdapter } = require("./adapters/manual-adapter") as {
    ManualPaymentAdapter: new () => PaymentAdapter;
  };
  return new ManualPaymentAdapter();
}
