// ===========================================
// DataInsight Mini — AI Service
// ===========================================
// SERVER-SIDE ONLY. Calls OpenAI-compatible API to generate
// business insights from analytical summaries.
// NEVER import this in client code.

import { insightResponseSchema } from "./insight-schemas";
import type { InsightRequestInput } from "./insight-schemas";
import type { InsightResponse } from "./insight-types";

// ── Constants ───────────────────────────────────

const MAX_OUTPUT_TOKENS = 4096;
const TEMPERATURE = 0.3; // Low temperature for factual analysis
const REQUEST_TIMEOUT_MS = 120_000;

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

// ── OpenAI-Compatible API Call ──────────────────

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content?: string;
      reasoning?: string;
    };
  }>;
}

/**
 * Generate business insights using OpenAI-compatible API.
 * SERVER-SIDE ONLY — requires AI_API_KEY, AI_BASE_URL env vars.
 */
export async function generateInsights(
  input: InsightRequestInput
): Promise<InsightResponse> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL ?? "auto";

  if (!apiKey || !baseUrl) {
    throw new GeminiServiceError(
      "AI_API_KEY atau AI_BASE_URL tidak dikonfigurasi di server.",
      "CONFIG_ERROR"
    );
  }

  const userPrompt = buildUserPrompt(input);

  // Call OpenAI-compatible API with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: userPrompt },
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new GeminiServiceError(
          "Batas penggunaan AI tercapai. Coba lagi nanti.",
          "RATE_LIMIT"
        );
      }
      const errorText = await response.text().catch(() => "Unknown error");
      throw new GeminiServiceError(
        `AI API error (${response.status}): ${errorText}`,
        "API_ERROR"
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;

    // Support both standard `content` and provider-specific `reasoning` field
    const msg = data.choices?.[0]?.message;
    const text = msg?.content || msg?.reasoning;

    if (!text || text.trim() === "") {
      throw new GeminiServiceError(
        "AI tidak mengembalikan respons.",
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
          "Permintaan ke AI melebihi batas waktu (120 detik).",
          "TIMEOUT"
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
