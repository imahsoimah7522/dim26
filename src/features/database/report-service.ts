// ===========================================
// Report Service — DataInsight Mini
// ===========================================
// Server Actions untuk report orders dan generated reports.
// ⚠️ Payment status hanya bisa diubah oleh admin client.

"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateOrderSchema, SaveReportSchema } from "./db-schemas";
import type { ReportOrderRow, GeneratedReportRow } from "./db-types";

/** Buat order laporan baru (selalu status 'pending'). */
export async function createReportOrder(
  input: unknown
): Promise<{ data: ReportOrderRow | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Anda harus login terlebih dahulu." };
  }

  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Data order tidak valid." };
  }

  const { data, error } = await supabase
    .from("report_orders")
    .insert({
      user_id: user.id,
      analysis_id: parsed.data.analysisId,
      tier: parsed.data.tier,
      price: parsed.data.price,
      payment_status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: "Gagal membuat order." };
  }

  return { data: data as ReportOrderRow, error: null };
}

/** Ambil semua orders milik user saat ini. */
export async function getReportOrders(): Promise<{
  data: ReportOrderRow[];
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: "Anda harus login terlebih dahulu." };
  }

  const { data, error } = await supabase
    .from("report_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: "Gagal memuat daftar order." };
  }

  return { data: (data as ReportOrderRow[]) ?? [], error: null };
}

/** Simpan referensi file laporan yang di-generate. */
export async function saveGeneratedReport(
  input: unknown
): Promise<{ data: GeneratedReportRow | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Anda harus login terlebih dahulu." };
  }

  const parsed = SaveReportSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Data laporan tidak valid." };
  }

  const { data, error } = await supabase
    .from("generated_reports")
    .insert({
      user_id: user.id,
      analysis_id: parsed.data.analysisId,
      order_id: parsed.data.orderId ?? null,
      storage_path: parsed.data.storagePath,
      is_demo: parsed.data.isDemo,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: "Gagal menyimpan laporan." };
  }

  return { data: data as GeneratedReportRow, error: null };
}

/** Ambil semua laporan milik user saat ini. */
export async function getGeneratedReports(): Promise<{
  data: GeneratedReportRow[];
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: "Anda harus login terlebih dahulu." };
  }

  const { data, error } = await supabase
    .from("generated_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: "Gagal memuat daftar laporan." };
  }

  return { data: (data as GeneratedReportRow[]) ?? [], error: null };
}
