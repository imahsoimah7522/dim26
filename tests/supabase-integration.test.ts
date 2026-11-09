// ===========================================
// Supabase Integration Tests — DataInsight Mini
// ===========================================
// Unit tests untuk schemas, types, dan RLS logic.
// ⚠️ Integration tests (User A/B isolation) memerlukan Supabase aktif.

import { describe, it, expect } from "vitest";

// ── Auth Schemas ────────────────────────────────

import {
  LoginSchema,
  SignupSchema,
  ProfileUpdateSchema,
} from "@/features/auth/auth-schemas";

describe("LoginSchema", () => {
  it("accepts valid login data", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = LoginSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("SignupSchema", () => {
  it("accepts valid signup data", () => {
    const result = SignupSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name too short", () => {
    const result = SignupSchema.safeParse({
      fullName: "J",
      email: "john@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without letters", () => {
    const result = SignupSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without numbers", () => {
    const result = SignupSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "abcdefgh",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password too short", () => {
    const result = SignupSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "Pass1",
    });
    expect(result.success).toBe(false);
  });
});

describe("ProfileUpdateSchema", () => {
  it("accepts valid profile update", () => {
    const result = ProfileUpdateSchema.safeParse({
      fullName: "John Doe",
      businessName: "Toko Maju",
      businessType: "Retail",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update", () => {
    const result = ProfileUpdateSchema.safeParse({
      businessName: "Toko Maju",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty update", () => {
    const result = ProfileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects name too long", () => {
    const result = ProfileUpdateSchema.safeParse({
      fullName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

// ── Database Schemas ────────────────────────────

import {
  SaveAnalysisSchema,
  CreateOrderSchema,
  SaveReportSchema,
  AnalysisSummarySchema,
} from "@/features/database/db-schemas";

describe("AnalysisSummarySchema", () => {
  it("accepts full summary", () => {
    const result = AnalysisSummarySchema.safeParse({
      totalRevenue: 50000000,
      totalTransactions: 1000,
      averageTransaction: 50000,
      uniqueProducts: 25,
      uniqueCategories: 5,
      dateRange: { start: "2024-01-01", end: "2024-12-31" },
      topProducts: [{ name: "Product A", revenue: 10000000, quantity: 200 }],
      topCategories: [{ name: "Food", revenue: 30000000 }],
      monthlyTrend: [
        { month: "2024-01", revenue: 5000000, transactions: 100 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal summary (all optional)", () => {
    const result = AnalysisSummarySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts summary with only revenue", () => {
    const result = AnalysisSummarySchema.safeParse({
      totalRevenue: 1000000,
    });
    expect(result.success).toBe(true);
  });
});

describe("SaveAnalysisSchema", () => {
  const validInput = {
    fileName: "sales_data.xlsx",
    fileSize: 102400,
    rowCount: 500,
    columnCount: 8,
    summary: { totalRevenue: 50000000 },
  };

  it("accepts valid analysis data", () => {
    const result = SaveAnalysisSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts with column mapping", () => {
    const result = SaveAnalysisSchema.safeParse({
      ...validInput,
      columnMapping: { date: "Tanggal", revenue: "Total" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts with AI insights", () => {
    const result = SaveAnalysisSchema.safeParse({
      ...validInput,
      hasAiInsights: true,
      aiInsights: { executive_summary: "Business is growing" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null column mapping", () => {
    const result = SaveAnalysisSchema.safeParse({
      ...validInput,
      columnMapping: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty file name", () => {
    const result = SaveAnalysisSchema.safeParse({
      ...validInput,
      fileName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero row count", () => {
    const result = SaveAnalysisSchema.safeParse({
      ...validInput,
      rowCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative file size", () => {
    const result = SaveAnalysisSchema.safeParse({
      ...validInput,
      fileSize: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing summary", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { summary: _summary, ...withoutSummary } = validInput;
    const result = SaveAnalysisSchema.safeParse(withoutSummary);
    expect(result.success).toBe(false);
  });
});

describe("CreateOrderSchema", () => {
  it("accepts valid free demo order", () => {
    const result = CreateOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "free_demo",
      price: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid paid report order", () => {
    const result = CreateOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "paid_report",
      price: 29000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid business pack order", () => {
    const result = CreateOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "business_pack",
      price: 79000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tier", () => {
    const result = CreateOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "premium",
      price: 100000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID", () => {
    const result = CreateOrderSchema.safeParse({
      analysisId: "not-a-uuid",
      tier: "free_demo",
      price: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = CreateOrderSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      tier: "paid_report",
      price: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("SaveReportSchema", () => {
  it("accepts valid report data", () => {
    const result = SaveReportSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      storagePath: "user-id/analysis-id/report.pdf",
      isDemo: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts with order ID", () => {
    const result = SaveReportSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      orderId: "660e8400-e29b-41d4-a716-446655440000",
      storagePath: "user-id/analysis-id/report.pdf",
      isDemo: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty storage path", () => {
    const result = SaveReportSchema.safeParse({
      analysisId: "550e8400-e29b-41d4-a716-446655440000",
      storagePath: "",
      isDemo: true,
    });
    expect(result.success).toBe(false);
  });
});

// ── RLS Policy Logic Tests ──────────────────────
// Simulasi logic RLS tanpa koneksi database.

describe("RLS Policy Logic", () => {
  const userA = { id: "user-a-uuid" };
  const userB = { id: "user-b-uuid" };

  const analysisOwnedByA = {
    id: "analysis-1",
    user_id: "user-a-uuid",
    file_name: "data_a.xlsx",
  };

  const analysisOwnedByB = {
    id: "analysis-2",
    user_id: "user-b-uuid",
    file_name: "data_b.xlsx",
  };

  // Simulasi RLS check: auth.uid() = user_id
  function canAccess(
    currentUser: { id: string } | null,
    record: { user_id: string }
  ): boolean {
    if (!currentUser) return false;
    return currentUser.id === record.user_id;
  }

  it("User A can access own analysis", () => {
    expect(canAccess(userA, analysisOwnedByA)).toBe(true);
  });

  it("User B can access own analysis", () => {
    expect(canAccess(userB, analysisOwnedByB)).toBe(true);
  });

  it("User A cannot access User B analysis", () => {
    expect(canAccess(userA, analysisOwnedByB)).toBe(false);
  });

  it("User B cannot access User A analysis", () => {
    expect(canAccess(userB, analysisOwnedByA)).toBe(false);
  });

  it("Unauthenticated user cannot access any analysis", () => {
    expect(canAccess(null, analysisOwnedByA)).toBe(false);
    expect(canAccess(null, analysisOwnedByB)).toBe(false);
  });

  // Simulasi payment status protection
  function canUpdatePaymentStatus(
    currentUser: { id: string } | null,
    _order: { user_id: string; payment_status: string },
    isServiceRole: boolean
  ): boolean {
    // Only service_role can update payment status
    // Regular users have NO UPDATE policy on report_orders
    if (isServiceRole) return true;
    if (!currentUser) return false;
    return false; // No update policy for regular users
  }

  it("User cannot mark own order as paid", () => {
    const order = {
      user_id: "user-a-uuid",
      payment_status: "pending",
    };
    expect(canUpdatePaymentStatus(userA, order, false)).toBe(false);
  });

  it("Service role can update payment status", () => {
    const order = {
      user_id: "user-a-uuid",
      payment_status: "pending",
    };
    expect(canUpdatePaymentStatus(userA, order, true)).toBe(true);
  });

  it("Unauthenticated user cannot update payment status", () => {
    const order = {
      user_id: "user-a-uuid",
      payment_status: "pending",
    };
    expect(canUpdatePaymentStatus(null, order, false)).toBe(false);
  });

  // Simulasi INSERT order constraint: payment_status must be 'pending'
  function canCreateOrder(
    currentUser: { id: string } | null,
    orderData: { user_id: string; payment_status: string }
  ): boolean {
    if (!currentUser) return false;
    if (currentUser.id !== orderData.user_id) return false;
    if (orderData.payment_status !== "pending") return false;
    return true;
  }

  it("User can create order with pending status", () => {
    expect(
      canCreateOrder(userA, {
        user_id: "user-a-uuid",
        payment_status: "pending",
      })
    ).toBe(true);
  });

  it("User cannot create order with paid status", () => {
    expect(
      canCreateOrder(userA, {
        user_id: "user-a-uuid",
        payment_status: "paid",
      })
    ).toBe(false);
  });

  it("User cannot create order for another user", () => {
    expect(
      canCreateOrder(userA, {
        user_id: "user-b-uuid",
        payment_status: "pending",
      })
    ).toBe(false);
  });
});
