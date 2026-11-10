// ===========================================
// DataInsight Mini — Insight Panel
// ===========================================
// Displays AI-generated business insights.

"use client";

import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Target,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  InsightResponse,
  ImportanceLevel,
} from "@/features/ai-insights/insight-types";

interface InsightPanelProps {
  response: InsightResponse;
  isDemo?: boolean;
}

const importanceBadge: Record<
  ImportanceLevel,
  { label: string; className: string }
> = {
  high: { label: "Tinggi", className: "bg-danger/10 text-danger" },
  medium: { label: "Sedang", className: "bg-warning/10 text-warning" },
  low: { label: "Rendah", className: "bg-muted text-muted-foreground" },
};

function Badge({ level }: { level: ImportanceLevel }) {
  const config = importanceBadge[level];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function InsightPanel({ response, isDemo = false }: InsightPanelProps) {
  // Demo: batasi ke 2 temuan utama saja
  const keyFindings = isDemo
    ? response.keyFindings.slice(0, 2)
    : response.keyFindings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy-900">
            AI Business Insights
          </h2>
          <p className="text-xs text-muted-foreground">
            Dihasilkan oleh Open Source AI berdasarkan ringkasan analisis
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-5">
        <h3 className="mb-2 text-sm font-semibold text-navy-900">
          📋 Ringkasan Eksekutif
        </h3>
        <p className="text-sm leading-relaxed text-navy-800">
          {response.executiveSummary}
        </p>
      </div>

      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-600" />
            <h3 className="text-sm font-semibold text-navy-900">
              Temuan Utama
              {isDemo && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (2 dari {response.keyFindings.length} temuan)
                </span>
              )}
            </h3>
          </div>
          <div className="space-y-3">
            {keyFindings.map((finding, i) => (
              <div
                key={`finding-${i}`}
                className="rounded-lg border border-border bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-navy-900">
                    {finding.title}
                  </h4>
                  <Badge level={finding.importance} />
                </div>
                <p className="text-sm text-navy-700">{finding.observation}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Bukti:</span> {finding.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Risks — hidden in demo */}
      {!isDemo && response.businessRisks.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-navy-900">
              Risiko Bisnis
            </h3>
          </div>
          <div className="space-y-3">
            {response.businessRisks.map((risk, i) => (
              <div
                key={`risk-${i}`}
                className="rounded-lg border border-warning/20 bg-warning/5 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-navy-900">
                    {risk.title}
                  </h4>
                  <Badge level={risk.severity} />
                </div>
                <p className="text-sm text-navy-700">{risk.description}</p>
                <p className="mt-2 text-xs text-accent-700">
                  <span className="font-medium">💡 Saran:</span>{" "}
                  {risk.suggestedAction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations — hidden in demo */}
      {!isDemo && response.recommendations.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-navy-900">
              Rekomendasi
            </h3>
          </div>
          <div className="space-y-3">
            {response.recommendations.map((rec, i) => (
              <div
                key={`rec-${i}`}
                className="rounded-lg border border-success/20 bg-success/5 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-navy-900">
                    {rec.title}
                  </h4>
                  <Badge level={rec.priority} />
                </div>
                <p className="text-sm text-navy-700">{rec.description}</p>
                <p className="mt-2 text-xs text-success">
                  <span className="font-medium">Dampak:</span>{" "}
                  {rec.expectedImpact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limitations — hidden in demo */}
      {!isDemo && response.limitations.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-navy-900">
              Keterbatasan Analisis
            </h3>
          </div>
          <div className="space-y-2">
            {response.limitations.map((lim, i) => (
              <div
                key={`lim-${i}`}
                className="rounded-lg border border-border bg-muted/50 p-3"
              >
                <p className="text-xs text-muted-foreground">
                  {lim.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Upgrade CTA */}
      {isDemo && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-5 text-center">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-purple-600" />
          <p className="text-sm font-semibold text-navy-900">
            Dapatkan Analisis Lengkap
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Beli laporan premium untuk melihat semua temuan, risiko bisnis,
            rekomendasi, dan analisis mendalam.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
        Insight ini dihasilkan oleh Open Source AI berdasarkan ringkasan data Anda.
        Selalu verifikasi rekomendasi sebelum mengambil keputusan bisnis.
      </div>
    </div>
  );
}

// ── Loading State ───────────────────────────────

export function InsightLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-white p-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-navy-900">
          Menghasilkan insight bisnis...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          AI sedang menganalisis ringkasan data Anda
        </p>
      </div>
    </div>
  );
}

// ── Error State ─────────────────────────────────

interface InsightErrorProps {
  error: string;
  onRetry: () => void;
}

export function InsightError({ error, onRetry }: InsightErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-danger/20 bg-danger/5 p-8">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <div className="text-center">
        <p className="text-sm font-medium text-navy-900">
          Gagal mendapatkan insight
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
