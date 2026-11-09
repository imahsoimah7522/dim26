// ===========================================
// Payment Tests — DataInsight Mini
// ===========================================
// Unit tests untuk payment schemas, types, dan logic.

import { describe, it, expect } from "vitest";

// ── Payment Types ───────────────────────────────

import {
  PAYMENT_TIERS,
  formatRupiah,
  generateOrderReference,
} from "@/features/payment/payment-types";

describe("PAYMENT_TIERS", () => {
  it("free_demo has price 0", () => {
    expect(PAYMENT_TIERS.free_demo.price).toBe(0);
  });

  it("paid_report has price 29000", () => {
    expect(PAYMENT_TIERS.paid_report.price).toBe(29000);
  });

  it("business_pack has price 79000", () => {
    expect(PAYMENT_TIERS.business_pack.price).toBe(79000);
  });

  it("business_pack has 5 credits", () => {
    expect(PAYMENT_TIERS.business_pack.credits).toBe(5);
  });

  it("paid_report has 1 credit", () => {
    expect(PAYMENT_TIERS.paid_report.credits).toBe(1);
  });

  it("free_demo has 0 credits", () => {
    expect(PAYMENT_TIERS.free_demo.credits).toBe(0);
  });
});

describe("formatRupiah", () => {
  it("formats positive amount", () => {
    const result = formatRupiah(29000);
    expect(result).toContain("29");
    expect(result).toContain("Rp");
  });

  it("formats zero", () => {
    const result = formatRupiah(0);
    expect(result).toContain("0");
    expect(result).toContain("Rp");
  });

  it("formats large amount", () => {
    const result = formatRupiah(79000);
    expect(result).toContain("79");
  });
});

describe("generateOrderReference", () => {
  it("generates reference with DIM prefix", () => {
    const ref = generateOrderReference();
    expect(ref).toMatch(/^DIM-/);
  });

  it("generates reference with date segment", () => {
    const ref = generateOrderReference();
    // Format: DIM-YYYYMMDD-XXXXXX
    expect(ref).toMatch(/^DIM-\d{8}-[A-Z0-9]{6}$/);
  });

  it("generates unique references", () => {
    const refs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      refs.add(generateOrderReference());
    }
    // With 31^6 possible random parts, 100 should all be unique
    expect(refs.size).toBe(100);
  });

  it("contains today's date", () => {
    const ref = generateOrderReference();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    expect(ref).toContain(today);
  });
});

// ── Payment Schemas ─────────────────────────────

import {
  CreatePaymentOrderSchema,
  VerifyPaymentSchema,
  WebhookPayloadSchema,
} from "@/features/payment/payment-schemas";

describe("CreatePaymentOrderSchema", () => {
  it("accepts valid paid_report order", () => {
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "paid_report",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid business_pack order", () => {
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "business_pack",
    });
    expect(result.success).toBe(true);
  });

  it("rejects free_demo tier (not purchasable)", () => {
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "free_demo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tier", () => {
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "premium",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid analysis ID", () => {
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "not-a-uuid",
      tier: "paid_report",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing tier", () => {
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("does not accept price from client", () => {
    // Schema should NOT have a price field — price is server-determined
    const result = CreatePaymentOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "paid_report",
      price: 0, // Trying to set price to 0
    });
    // Should succeed but ignore the price field
    expect(result.success).toBe(true);
    if (result.success) {
      expect("price" in result.data).toBe(false);
    }
  });
});

describe("VerifyPaymentSchema", () => {
  it("accepts valid verification", () => {
    const result = VerifyPaymentSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("accepts verification with notes", () => {
    const result = VerifyPaymentSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      notes: "Transfer BCA confirmed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid order ID", () => {
    const result = VerifyPaymentSchema.safeParse({
      orderId: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes too long", () => {
    const result = VerifyPaymentSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("WebhookPayloadSchema", () => {
  it("accepts paid status", () => {
    const result = WebhookPayloadSchema.safeParse({
      orderId: "order-123",
      status: "paid",
      transactionId: "txn-456",
      amount: 29000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts failed status", () => {
    const result = WebhookPayloadSchema.safeParse({
      orderId: "order-123",
      status: "failed",
    });
    expect(result.success).toBe(true);
  });

  it("accepts expired status", () => {
    const result = WebhookPayloadSchema.safeParse({
      orderId: "order-123",
      status: "expired",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = WebhookPayloadSchema.safeParse({
      orderId: "order-123",
      status: "refunded",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing orderId", () => {
    const result = WebhookPayloadSchema.safeParse({
      status: "paid",
    });
    expect(result.success).toBe(false);
  });
});

// ── Payment Security Logic ──────────────────────

describe("Payment Security Logic", () => {
  // Simulasi: harga ditentukan server, bukan client
  function getServerPrice(tier: string): number | null {
    const prices: Record<string, number> = {
      paid_report: 29000,
      business_pack: 79000,
    };
    return prices[tier] ?? null;
  }

  it("server determines price for paid_report", () => {
    expect(getServerPrice("paid_report")).toBe(29000);
  });

  it("server determines price for business_pack", () => {
    expect(getServerPrice("business_pack")).toBe(79000);
  });

  it("rejects unknown tier", () => {
    expect(getServerPrice("premium")).toBeNull();
  });

  // Simulasi: hanya paid orders bisa download
  function canDownload(orderStatus: string): boolean {
    return orderStatus === "paid";
  }

  it("allows download for paid order", () => {
    expect(canDownload("paid")).toBe(true);
  });

  it("blocks download for pending order", () => {
    expect(canDownload("pending")).toBe(false);
  });

  it("blocks download for failed order", () => {
    expect(canDownload("failed")).toBe(false);
  });

  it("blocks download for refunded order", () => {
    expect(canDownload("refunded")).toBe(false);
  });

  // Simulasi: duplicate webhook prevention
  function shouldProcessWebhook(
    currentStatus: string,
    newStatus: string
  ): boolean {
    if (currentStatus === "paid") return false; // Already processed
    if (currentStatus === newStatus) return false; // No change
    return true;
  }

  it("processes webhook for pending → paid", () => {
    expect(shouldProcessWebhook("pending", "paid")).toBe(true);
  });

  it("skips duplicate webhook for paid → paid", () => {
    expect(shouldProcessWebhook("paid", "paid")).toBe(false);
  });

  it("skips webhook when already paid → failed", () => {
    expect(shouldProcessWebhook("paid", "failed")).toBe(false);
  });

  it("processes webhook for pending → failed", () => {
    expect(shouldProcessWebhook("pending", "failed")).toBe(true);
  });

  // Simulasi: business pack credit tracking
  function calculateCredits(
    paidPackCount: number,
    usedReports: number
  ): { total: number; used: number; remaining: number } {
    const total = paidPackCount * 5;
    return { total, used: usedReports, remaining: total - usedReports };
  }

  it("calculates credits for 1 business pack", () => {
    const credits = calculateCredits(1, 0);
    expect(credits).toEqual({ total: 5, used: 0, remaining: 5 });
  });

  it("tracks used credits", () => {
    const credits = calculateCredits(1, 3);
    expect(credits).toEqual({ total: 5, used: 3, remaining: 2 });
  });

  it("handles fully used credits", () => {
    const credits = calculateCredits(1, 5);
    expect(credits).toEqual({ total: 5, used: 5, remaining: 0 });
  });

  it("handles multiple packs", () => {
    const credits = calculateCredits(2, 3);
    expect(credits).toEqual({ total: 10, used: 3, remaining: 7 });
  });

  it("handles zero packs", () => {
    const credits = calculateCredits(0, 0);
    expect(credits).toEqual({ total: 0, used: 0, remaining: 0 });
  });

  // Simulasi: ownership validation
  function validateOwnership(
    requestUserId: string | null,
    orderUserId: string
  ): boolean {
    if (!requestUserId) return false;
    return requestUserId === orderUserId;
  }

  it("allows owner to access order", () => {
    expect(validateOwnership("user-a", "user-a")).toBe(true);
  });

  it("blocks non-owner from accessing order", () => {
    expect(validateOwnership("user-a", "user-b")).toBe(false);
  });

  it("blocks unauthenticated access", () => {
    expect(validateOwnership(null, "user-a")).toBe(false);
  });
});
