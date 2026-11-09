// ===========================================
// Analysis Service — DataInsight Mini
// ===========================================
// Server Actions untuk CRUD analisis.
// user_id selalu diambil dari auth session, bukan dari client.

"use server";

import { createClient } from "@/lib/supabase/server";
import { SaveAnalysisSchema } from "./db-schemas";
import type { AnalysisRow } from "./db-types";

/** Simpan metadata dan summary analisis ke database. */
export async function saveAnalysis(
  input: unknown
): Promise<{ data: AnalysisRow | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Anda harus login terlebih dahulu." };
  }

  const parsed = SaveAnalysisSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Data analisis tidak valid." };
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      file_name: parsed.data.fileName,
      file_size: parsed.data.fileSize,
      row_count: parsed.data.rowCount,
      column_count: parsed.data.columnCount,
      column_mapping: parsed.data.columnMapping ?? null,
      summary: parsed.data.summary,
      has_ai_insights: parsed.data.hasAiInsights ?? false,
      ai_insights: parsed.data.aiInsights ?? null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: "Gagal menyimpan analisis." };
  }

  return { data: data as AnalysisRow, error: null };
}

/** Ambil semua analisis milik user saat ini (terbaru duluan). */
export async function getAnalyses(): Promise<{
  data: AnalysisRow[];
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
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: "Gagal memuat riwayat analisis." };
  }

  return { data: (data as AnalysisRow[]) ?? [], error: null };
}

/** Ambil satu analisis berdasarkan ID (ownership enforced by RLS). */
export async function getAnalysisById(
  id: string
): Promise<{ data: AnalysisRow | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Anda harus login terlebih dahulu." };
  }

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: "Analisis tidak ditemukan." };
  }

  return { data: data as AnalysisRow, error: null };
}

/** Hapus analisis (ownership enforced by RLS). */
export async function deleteAnalysis(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const { error } = await supabase.from("analyses").delete().eq("id", id);

  if (error) {
    return { error: "Gagal menghapus analisis." };
  }

  return { error: null };
}
