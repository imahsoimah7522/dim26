// ===========================================
// Payment Service — DataInsight Mini
// ===========================================
// Server actions untuk payment flow.
// Harga diambil dari PAYMENT_TIERS, BUKAN dari client.

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreatePaymentOrderSchema } from "./payment-schemas";
import {
  PAYMENT_TIERS,
  generateOrderReference,
  type PaidTier,
  type PaymentInstructions,
  type OrderDetail,
} from "./payment-types";
import type { ReportOrderRow } from "@/features/database/db-types";

// ── Create Order ────────────────────────────────

interface CreateOrderResult {
  data: {
    orderId: string;
    orderReference: string;
    instructions: PaymentInstructions;
  } | null;
  error: string | null;
}

/** Buat order pembayaran. Harga ditentukan server-side. */
export async function createPaymentOrder(
  input: unknown
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Anda harus login terlebih dahulu." };
  }

  const parsed = CreatePaymentOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Data order tidak valid." };
  }

  const { analysisId, tier } = parsed.data;

  // Validasi analysis exists dan milik user
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("id", analysisId)
    .single();

  if (!analysis) {
    return { data: null, error: "Analisis tidak ditemukan." };
  }

  // Harga dari config, BUKAN dari client
  const tierConfig = PAYMENT_TIERS[tier];
  const orderReference = generateOrderReference();

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("report_orders")
    .insert({
      user_id: user.id,
      analysis_id: analysisId,
      tier,
      price: tierConfig.price,
      payment_status: "pending",
      payment_reference: orderReference,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { data: null, error: "Gagal membuat order." };
  }

  // Log payment event via admin client (bypass RLS)
  const admin = createAdminClient();
  await admin.from("payment_events").insert({
    order_id: order.id,
    event_type: "initiated",
    payload: { tier, price: tierConfig.price, reference: orderReference },
  });

  // Generate payment instructions
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

  const instructions: PaymentInstructions = {
    method: "Bank Transfer",
    bankName: "BCA",
    accountNumber: "1234567890",
    accountHolder: "PT DataInsight Mini",
    amount: tierConfig.price,
    orderReference,
    expiresAt,
  };

  return {
    data: {
      orderId: order.id,
      orderReference,
      instructions,
    },
    error: null,
  };
}

// ── Get Orders ──────────────────────────────────

/** Ambil semua orders milik user dengan info analisis. */
export async function getUserOrders(): Promise<{
  data: OrderDetail[];
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: "Anda harus login terlebih dahulu." };
  }

  const { data: orders, error } = await supabase
    .from("report_orders")
    .select("*, analyses(file_name)")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: "Gagal memuat daftar order." };
  }

  const details: OrderDetail[] = (orders ?? []).map((o: ReportOrderRow & { analyses: { file_name: string } | null }) => ({
    id: o.id,
    analysisId: o.analysis_id,
    tier: o.tier,
    price: o.price,
    status: o.payment_status,
    paymentReference: o.payment_reference,
    fileName: o.analyses?.file_name ?? "Unknown",
    createdAt: o.created_at,
    isPaid: o.payment_status === "paid",
    canDownload: o.payment_status === "paid",
  }));

  return { data: details, error: null };
}

/** Ambil detail satu order (ownership enforced by RLS). */
export async function getOrderById(
  orderId: string
): Promise<{ data: OrderDetail | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Anda harus login terlebih dahulu." };
  }

  const { data: order, error } = await supabase
    .from("report_orders")
    .select("*, analyses(file_name)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { data: null, error: "Order tidak ditemukan." };
  }

  const o = order as ReportOrderRow & { analyses: { file_name: string } | null };

  return {
    data: {
      id: o.id,
      analysisId: o.analysis_id,
      tier: o.tier,
      price: o.price,
      status: o.payment_status,
      paymentReference: o.payment_reference,
      fileName: o.analyses?.file_name ?? "Unknown",
      createdAt: o.created_at,
      isPaid: o.payment_status === "paid",
      canDownload: o.payment_status === "paid",
    },
    error: null,
  };
}

// ── Available Credits ───────────────────────────

/** Hitung credits yang tersedia dari business pack. */
export async function getAvailableCredits(): Promise<{
  total: number;
  used: number;
  remaining: number;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { total: 0, used: 0, remaining: 0 };
  }

  // Count paid business_pack orders
  const { data: bpOrders } = await supabase
    .from("report_orders")
    .select("id")
    .eq("tier", "business_pack")
    .eq("payment_status", "paid");

  const totalCredits = (bpOrders?.length ?? 0) * 5;

  if (totalCredits === 0) {
    return { total: 0, used: 0, remaining: 0 };
  }

  // Count used credits (generated reports linked to these orders)
  const orderIds = bpOrders!.map((o: { id: string }) => o.id);
  const { count } = await supabase
    .from("generated_reports")
    .select("id", { count: "exact", head: true })
    .in("order_id", orderIds)
    .eq("is_demo", false);

  const used = count ?? 0;

  return { total: totalCredits, used, remaining: totalCredits - used };
}

// ── Use Credit ──────────────────────────────────

/** Gunakan 1 credit dari business pack untuk analisis tertentu. */
export async function useCredit(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  analysisId: string
): Promise<{ orderId: string | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { orderId: null, error: "Anda harus login terlebih dahulu." };
  }

  // Cari business_pack order yang masih punya credit
  const { data: bpOrders } = await supabase
    .from("report_orders")
    .select("id")
    .eq("tier", "business_pack")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: true });

  if (!bpOrders || bpOrders.length === 0) {
    return { orderId: null, error: "Tidak ada credit tersedia." };
  }

  // Cari order yang masih punya sisa credit
  for (const order of bpOrders) {
    const { count } = await supabase
      .from("generated_reports")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id)
      .eq("is_demo", false);

    if ((count ?? 0) < 5) {
      // Masih ada credit — link generated report ke order ini
      return { orderId: order.id, error: null };
    }
  }

  return { orderId: null, error: "Semua credit sudah digunakan." };
}

// ── Save Report to Storage ──────────────────────

/** Simpan PDF ke Supabase Storage dan catat di generated_reports. */
export async function saveReportToStorage(input: {
  analysisId: string;
  orderId?: string;
  pdfBlob: Blob;
  isDemo: boolean;
}): Promise<{ downloadUrl: string | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { downloadUrl: null, error: "Anda harus login terlebih dahulu." };
  }

  // Jika bukan demo, verifikasi order sudah paid
  if (!input.isDemo && input.orderId) {
    const { data: order } = await supabase
      .from("report_orders")
      .select("payment_status")
      .eq("id", input.orderId)
      .single();

    if (!order || order.payment_status !== "paid") {
      return { downloadUrl: null, error: "Pembayaran belum dikonfirmasi." };
    }
  }

  const timestamp = Date.now();
  const storagePath = `${user.id}/${input.analysisId}/report-${timestamp}.pdf`;

  // Upload ke Storage
  const { error: uploadError } = await supabase.storage
    .from("reports")
    .upload(storagePath, input.pdfBlob, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return { downloadUrl: null, error: "Gagal mengupload laporan." };
  }

  // Catat di generated_reports
  await supabase.from("generated_reports").insert({
    user_id: user.id,
    analysis_id: input.analysisId,
    order_id: input.orderId ?? null,
    storage_path: storagePath,
    is_demo: input.isDemo,
  });

  // Generate signed URL (1 jam)
  const { data: signedData } = await supabase.storage
    .from("reports")
    .createSignedUrl(storagePath, 3600);

  return { downloadUrl: signedData?.signedUrl ?? null, error: null };
}

// ── Get Download URL ────────────────────────────

/** Ambil signed URL untuk download laporan. */
export async function getReportDownloadUrl(
  reportId: string
): Promise<{ downloadUrl: string | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { downloadUrl: null, error: "Anda harus login terlebih dahulu." };
  }

  const { data: report } = await supabase
    .from("generated_reports")
    .select("storage_path, is_demo, order_id")
    .eq("id", reportId)
    .single();

  if (!report) {
    return { downloadUrl: null, error: "Laporan tidak ditemukan." };
  }

  // Jika paid report, verifikasi order masih paid
  if (!report.is_demo && report.order_id) {
    const { data: order } = await supabase
      .from("report_orders")
      .select("payment_status")
      .eq("id", report.order_id)
      .single();

    if (!order || order.payment_status !== "paid") {
      return { downloadUrl: null, error: "Pembayaran belum dikonfirmasi." };
    }
  }

  const { data: signedData } = await supabase.storage
    .from("reports")
    .createSignedUrl(report.storage_path, 3600);

  return { downloadUrl: signedData?.signedUrl ?? null, error: null };
}

// ── Admin: Verify Payment ───────────────────────

/** Admin-only: Verifikasi pembayaran (update status → paid). */
export async function adminVerifyPayment(
  orderId: string,
  notes?: string
): Promise<{ error: string | null }> {
  // Gunakan admin client (bypass RLS)
  const admin = createAdminClient();

  // Cek order exists
  const { data: order } = await admin
    .from("report_orders")
    .select("id, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order tidak ditemukan." };
  }

  // Cegah duplicate processing
  if (order.payment_status === "paid") {
    return { error: null }; // Already paid, skip
  }

  // Update status
  const { error: updateError } = await admin
    .from("report_orders")
    .update({
      payment_status: "paid" as PaidTier, // Using PaidTier just for type narrowing reference
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    return { error: "Gagal memperbarui status pembayaran." };
  }

  // Log event
  await admin.from("payment_events").insert({
    order_id: orderId,
    event_type: "verified",
    payload: { verified_at: new Date().toISOString(), notes: notes ?? null },
  });

  return { error: null };
}
