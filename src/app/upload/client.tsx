// ===========================================
// DataInsight Mini — Upload Page Client
// ===========================================
// Client component: upload → preview → column mapping → analytics.

"use client";

import Link from "next/link";
import { FileSpreadsheet, Table, Clock, Shield, Loader2 } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DataPreview } from "@/components/upload/data-preview";
import { ColumnMapper } from "@/components/upload/column-mapper";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { useImport } from "@/hooks/use-import";
import { useAnalytics } from "@/hooks/use-analytics";

const instructions = [
  {
    icon: FileSpreadsheet,
    title: "Format yang Didukung",
    description: "Excel (.xlsx) dan CSV (.csv)",
  },
  {
    icon: Table,
    title: "Struktur Data",
    description: "Baris pertama harus berisi header kolom",
  },
  {
    icon: Clock,
    title: "Batas Ukuran",
    description: "Maks 5 MB, 10.000 baris, 50 kolom",
  },
  {
    icon: Shield,
    title: "Privasi Data",
    description: "File diproses di browser, tidak dikirim ke server",
  },
] as const;

export function UploadPageClient() {
  const { state: importState, handleFile, reset: resetImport } = useImport();
  const {
    state: analyticsState,
    setMapping,
    analyze,
    reset: resetAnalytics,
  } = useAnalytics();

  const isProcessing =
    importState.step === "validating" ||
    importState.step === "parsing" ||
    importState.step === "profiling";

  const showColumnMapper =
    importState.step === "ready" &&
    importState.profile &&
    analyticsState.step === "mapping";

  const showDashboard =
    analyticsState.step === "done" &&
    analyticsState.result !== null &&
    analyticsState.chartData !== null;

  const showAnalyzing = analyticsState.step === "analyzing";

  const handleAnalyze = () => {
    if (!importState.parseResult || !importState.profile) return;
    analyze(importState.parseResult.rows);
  };

  const handleFullReset = () => {
    resetImport();
    resetAnalytics();
  };

  const handleBackToMapping = () => {
    resetAnalytics();
  };

  // ── Show Dashboard ──────────────────────────
  if (showDashboard && analyticsState.result && analyticsState.chartData) {
    return (
      <AnalyticsDashboard
        result={analyticsState.result}
        chartData={analyticsState.chartData}
        qualityIssues={importState.profile?.qualityIssues ?? []}
        fileName={importState.profile?.fileName ?? "data"}
        fileSize={importState.profile?.fileSize ?? 0}
        onBack={handleBackToMapping}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <UploadZone
        onFileSelected={handleFile}
        onClear={handleFullReset}
        selectedFile={importState.file}
        isProcessing={isProcessing}
        error={importState.error}
      />

      {/* Sheet selector for multi-sheet XLSX */}
      {importState.availableSheets.length > 1 && importState.step === "ready" && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3">
          <span className="text-xs font-medium text-muted-foreground">Worksheet:</span>
          <div className="flex flex-wrap gap-1.5">
            {importState.availableSheets.map((sheet) => (
              <button
                key={sheet}
                type="button"
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  sheet === importState.selectedSheet
                    ? "bg-accent-600 text-white"
                    : "bg-muted text-muted-foreground hover:bg-navy-100"
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Profile & Preview */}
      {importState.profile && importState.step === "ready" && (
        <DataPreview profile={importState.profile} />
      )}

      {/* Column Mapper */}
      {showColumnMapper && importState.profile && (
        <ColumnMapper
          columns={importState.profile.columns}
          mapping={analyticsState.mapping}
          onMappingChange={setMapping}
          onAnalyze={handleAnalyze}
          isAnalyzing={showAnalyzing}
        />
      )}

      {/* Analyzing spinner */}
      {showAnalyzing && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-white p-8">
          <Loader2 className="h-5 w-5 animate-spin text-accent-600" />
          <span className="text-sm font-medium text-navy-900">
            Menganalisis data...
          </span>
        </div>
      )}

      {/* Analytics error */}
      {analyticsState.step === "error" && analyticsState.error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {analyticsState.error}
        </div>
      )}

      {/* Instructions (shown when no file selected) */}
      {importState.step === "idle" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {instructions.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-lg border border-border bg-white p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-accent-200 bg-accent-50 p-4">
            <h3 className="text-sm font-semibold text-navy-900">
              💡 Tips untuk Hasil Terbaik
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>• Pastikan data memiliki kolom tanggal, nama produk, jumlah, dan harga.</li>
              <li>• Hapus baris kosong atau baris total/subtotal sebelum upload.</li>
              <li>• Gunakan format tanggal yang konsisten (contoh: 2024-01-15).</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Belum punya data?{" "}
              <Link
                href="/demo"
                className="font-medium text-accent-600 hover:text-accent-700 hover:underline"
              >
                Lihat demo gratis
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
