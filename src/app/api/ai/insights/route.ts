// ===========================================
// DataInsight Mini — POST /api/ai/insights
// ===========================================
// Secure server-side endpoint for Gemini AI insights.
// Validates input, calls Gemini, validates output.

import { NextResponse } from "next/server";
import { insightRequestSchema } from "@/features/ai-insights/insight-schemas";
import {
  generateInsights,
  GeminiServiceError,
} from "@/features/ai-insights/gemini-service";

export async function POST(request: Request) {
  try {
    // 1. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body bukan JSON yang valid." },
        { status: 400 }
      );
    }

    // 2. Validate input with Zod
    const parsed = insightRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message = firstIssue
        ? `Validasi gagal: ${firstIssue.message}`
        : "Input tidak valid.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const input = parsed.data;

    // 3. Check user consent
    if (!input.userConsent) {
      return NextResponse.json(
        { error: "Persetujuan pengguna diperlukan untuk mengirim data ke AI." },
        { status: 403 }
      );
    }

    // 4. Call Gemini API
    const insights = await generateInsights(input);

    // 5. Return validated response
    return NextResponse.json(insights);
  } catch (error) {
    // Handle known Gemini errors
    if (error instanceof GeminiServiceError) {
      const statusMap: Record<string, number> = {
        CONFIG_ERROR: 500,
        EMPTY_RESPONSE: 502,
        INVALID_JSON: 502,
        VALIDATION_ERROR: 502,
        TIMEOUT: 504,
        RATE_LIMIT: 429,
        API_ERROR: 502,
        UNKNOWN_ERROR: 500,
      };

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusMap[error.code] ?? 500 }
      );
    }

    // Unknown error — don't leak internals
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
