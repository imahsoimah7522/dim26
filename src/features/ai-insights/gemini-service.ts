// ===========================================
// DataInsight Mini — Gemini Service
// ===========================================
// SERVER-SIDE ONLY. Calls Gemini API to generate
// business insights from analytical summaries.
// NEVER import this in client code.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { insightResponseSchema } from "./insight-schemas";
import type { InsightRequestInput } from "./insight-schemas";
import type { InsightResponse } from "./insight-types";

// ── Constants ───────────────────────────────────

const MODEL_NAME = "gemini-2.0-flash";
const MAX_OUTPUT_TOKENS = 4096;
const TEMPERATURE = 0.3; // Low temperature for factual analysis
const REQUEST_TIMEOUT_MS = 30_000;

// ── System Instruction ──────────────────────────

const SYSTEM_INSTRUCTION = `Kamu adalah seorang analis data bisnis profesional untuk UMKM di Indonesia.

ATURAN KETAT:
1. Jelaskan HANYA metrik yang diberikan dalam data. Jangan mengarang angka.
2. Jangan mengarang tren yang tidak ada dalam data.
3. Jangan mengklaim hubungan sebab-akibat tanpa bukti dari data.
4. Bedakan antara temuan (fakta dari data) dan rekomendasi (saran tindakan).
5. Jika informasi tidak cukup untuk kesimpulan tertentu, nyatakan sebagai keterbatasan.
6. Gunakan bahasa Indonesia yang sederhana dan mudah dipahami pemilik usaha.
7. Berikan rekomendasi yang praktis dan realistis untuk skala UMKM.
8. Setiap temuan HARUS merujuk ke data spesifik yang diberikan (evidence).

FORMAT OUTPUT:
Kembalikan JSON yang valid dengan struktur berikut:
{
  "executiveSummary": "Ringkasan eksekutif 2-3 kalimat tentang kondisi bisnis berdasarkan data.",
  "keyFindings": [
    {
      "title": "Judul temuan singkat",
      "observation": "Penjelasan temuan berdasarkan data",
      "evidence": "Data spesifik yang mendukung temuan ini",
      "importance": "high | medium | low"
    }
  ],
  "businessRisks": [
    {
      "title": "Judul risiko",
      "description": "Penjelasan risiko berdasarkan data",
      "severity": "high | medium | low",
      "suggestedAction": "Langkah yang disarankan"
    }
  ],
  "recommendations": [
    {
      "title": "Judul rekomendasi",
      "description": "Penjelasan rekomendasi",
      "priority": "high | medium | low",
      "expectedImpact": "Dampak yang diharapkan"
    }
  ],
  "limitations": [
    {
      "description": "Keterbatasan analisis ini"
    }
  ]
}

PENTING: Kembalikan HANYA JSON yang valid, tanpa markdown code block atau teks tambahan.`;

// ── Build Prompt ────────────────────────────────

function buildUserPrompt(input: InsightRequestInput): string {
  const parts: string[] = [];

  parts.push(`Jenis Bisnis: ${translateBusinessType(input.businessType)}`);
  parts.push(`Jumlah Data: ${input.rowCount.toLocaleString("id-ID")} baris`);

  // KPIs
  parts.push("\n--- KPI UTAMA ---");
  for (const kpi of input.kpis) {
    if (kpi.available) {
      parts.push(`• ${kpi.label}: ${kpi.formattedValue}`);
    } else {
      parts.push(`• ${kpi.label}: Tidak tersedia`);
    }
  }

  // Monthly trend
  if (input.monthlyTrend.length > 0) {
    parts.push("\n--- TREN BULANAN ---");
    for (const month of input.monthlyTrend) {
      parts.push(
        `• ${month.period}: Pendapatan ${formatForPrompt(month.revenue)}, ` +
        `Kuantitas ${month.quantity.toLocaleString("id-ID")}, ` +
        `${month.transactionCount} transaksi`
      );
    }
  }

  // Top products
  if (input.topProducts.length > 0) {
    parts.push("\n--- PRODUK TERATAS ---");
    for (const p of input.topProducts) {
      parts.push(
        `• ${p.name}: ${formatForPrompt(p.revenue)} (${(p.percentage * 100).toFixed(1)}%)`
      );
    }
  }

  // Bottom products
  if (input.bottomProducts.length > 0) {
    parts.push("\n--- PRODUK TERENDAH ---");
    for (const p of input.bottomProducts) {
      parts.push(
        `• ${p.name}: ${formatForPrompt(p.revenue)} (${(p.percentage * 100).toFixed(1)}%)`
      );
    }
  }

  // Category breakdown
  if (input.revenueByCategory.length > 0) {
    parts.push("\n--- PENDAPATAN PER KATEGORI ---");
    for (const c of input.revenueByCategory) {
      parts.push(
        `• ${c.name}: ${formatForPrompt(c.revenue)} (${(c.percentage * 100).toFixed(1)}%)`
      );
    }
  }

  // Quality findings
  if (input.qualityFindings.length > 0) {
    parts.push("\n--- KUALITAS DATA ---");
    for (const q of input.qualityFindings) {
      parts.push(`• [${q.severity}] ${q.message}`);
    }
  }

  parts.push("\nBerdasarkan data di atas, berikan analisis bisnis dalam format JSON yang diminta.");

  return parts.join("\n");
}

function translateBusinessType(type: string): string {
  const map: Record<string, string> = {
    retail: "Retail / Toko",
    fnb: "Makanan & Minuman (F&B)",
    services: "Jasa / Layanan",
    wholesale: "Grosir / Distributor",
    other: "Lainnya",
  };
  return map[type] ?? type;
}

function formatForPrompt(value: number): string {
  return "Rp" + Math.round(value).toLocaleString("id-ID");
}

// ── Main Service ────────────────────────────────

/**
 * Generate business insights using Gemini API.
 * SERVER-SIDE ONLY — requires GEMINI_API_KEY env var.
 */
export async function generateInsights(
  input: InsightRequestInput
): Promise<InsightResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiServiceError(
      "GEMINI_API_KEY tidak dikonfigurasi di server.",
      "CONFIG_ERROR"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
      responseMimeType: "application/json",
    },
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const userPrompt = buildUserPrompt(input);

  // Call Gemini with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });

    clearTimeout(timeoutId);

    const response = result.response;
    const text = response.text();

    if (!text || text.trim() === "") {
      throw new GeminiServiceError(
        "Gemini tidak mengembalikan respons.",
        "EMPTY_RESPONSE"
      );
    }

    // Parse JSON from response
    let parsed: unknown;
    try {
      // Strip markdown code block if present
      const cleaned = text
        .replace(/^```json?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new GeminiServiceError(
        "Respons AI bukan JSON yang valid.",
        "INVALID_JSON"
      );
    }

    // Validate with Zod
    const validated = insightResponseSchema.safeParse(parsed);
    if (!validated.success) {
      throw new GeminiServiceError(
        "Respons AI tidak sesuai format yang diharapkan.",
        "VALIDATION_ERROR"
      );
    }

    return validated.data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof GeminiServiceError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new GeminiServiceError(
          "Permintaan ke AI melebihi batas waktu (30 detik).",
          "TIMEOUT"
        );
      }

      // Rate limit
      if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
        throw new GeminiServiceError(
          "Batas penggunaan AI tercapai. Coba lagi nanti.",
          "RATE_LIMIT"
        );
      }

      // Generic API error
      throw new GeminiServiceError(
        `Gagal mendapatkan insight dari AI: ${error.message}`,
        "API_ERROR"
      );
    }

    throw new GeminiServiceError(
      "Terjadi kesalahan yang tidak diketahui saat menghubungi AI.",
      "UNKNOWN_ERROR"
    );
  }
}

// ── Error Class ─────────────────────────────────

export type GeminiErrorCode =
  | "CONFIG_ERROR"
  | "EMPTY_RESPONSE"
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "API_ERROR"
  | "UNKNOWN_ERROR";

export class GeminiServiceError extends Error {
  public readonly code: GeminiErrorCode;

  constructor(message: string, code: GeminiErrorCode) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
  }
}
