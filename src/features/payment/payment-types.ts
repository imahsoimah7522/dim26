// ===========================================
// Payment Types — DataInsight Mini
// ===========================================

/** Konfigurasi tier pembayaran — source of truth untuk harga */
export const PAYMENT_TIERS = {
  free_demo: { price: 0, credits: 0, label: "Demo Gratis" },
  paid_report: { price: 29000, credits: 1, label: "Laporan Tunggal" },
  business_pack: { price: 79000, credits: 5, label: "Paket Bisnis" },
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;
export type PaidTier = Exclude<PaymentTier, "free_demo">;
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

/** Data order untuk adapter */
export interface OrderData {
  orderId: string;
  orderReference: string;
  amount: number;
  tier: PaidTier;
  userEmail: string;
}

/** Hasil dari createPayment adapter */
export interface PaymentResult {
  success: boolean;
  instructions?: PaymentInstructions;
  redirectUrl?: string;
  error?: string;
}

/** Instruksi pembayaran (manual transfer) */
export interface PaymentInstructions {
  method: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  orderReference: string;
  expiresAt: string;
}

/** Hasil verifikasi pembayaran */
export interface VerificationResult {
  success: boolean;
  orderId: string;
  status: OrderStatus;
  error?: string;
}

/** State pembelian untuk UI */
export interface PurchaseState {
  step: "idle" | "selecting" | "creating" | "instructions" | "done" | "error";
  orderReference?: string;
  instructions?: PaymentInstructions;
  error?: string;
}

/** Order detail untuk UI */
export interface OrderDetail {
  id: string;
  analysisId: string;
  tier: PaymentTier;
  price: number;
  status: OrderStatus;
  paymentReference: string | null;
  fileName: string;
  createdAt: string;
  isPaid: boolean;
  canDownload: boolean;
}

/** Format Rupiah */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Generate unique order reference: DIM-YYYYMMDD-XXXXXX */
export function generateOrderReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DIM-${date}-${random}`;
}
