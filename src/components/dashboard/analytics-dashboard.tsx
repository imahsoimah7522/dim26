// ===========================================
// DataInsight Mini — Analytics Dashboard
// ===========================================
// Combines KPI cards, charts, summary table,
// and AI insights into the full results view.

"use client";

import { useState } from "react";
import { ArrowLeft, BarChart3, Sparkles, FileDown, Loader2, CheckCircle2 } from "lucide-react";
import type { AnalyticsResult, ChartData } from "@/features/analytics/analytics-types";
import type { QualityIssue } from "@/features/data-import/import-types";
import type { BusinessType } from "@/features/ai-insights/insight-types";
import type { ReportData } from "@/features/report/report-types";
import { AnalyticsKPICard } from "@/components/dashboard/analytics-kpi-card";
import { AnalyticsSalesChart } from "@/components/dashboard/analytics-sales-chart";
import { AnalyticsProductChart } from "@/components/dashboard/analytics-product-chart";
import { AnalyticsCategoryChart } from "@/components/dashboard/analytics-category-chart";
import { AnalyticsSummaryTable } from "@/components/dashboard/analytics-summary-table";
import { ConsentDialog } from "@/components/insight/consent-dialog";
import {
  InsightPanel,
  InsightLoading,
  InsightError,
} from "@/components/insight/insight-panel";
import { useInsights } from "@/hooks/use-insights";
import { useReport } from "@/hooks/use-report";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  result: AnalyticsResult;
  chartData: ChartData;
  qualityIssues: QualityIssue[];
  fileName: string;
  fileSize: number;
  onBack: () => void;
}

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "retail", label: "Retail / Toko" },
  { value: "fnb", label: "Makanan & Minuman" },
  { value: "services", label: "Jasa / Layanan" },
  { value: "wholesale", label: "Grosir / Distributor" },
  { value: "other", label: "Lainnya" },
];

export function AnalyticsDashboard({
  result,
  chartData,
  qualityIssues,
  fileName,
  fileSize,
  onBack,
}: AnalyticsDashboardProps) {
  const [businessType, setBusinessType] = useState<BusinessType>("retail");
  const {
    state: insightState,
    requestConsent,
    cancelConsent,
    generateInsights,
    reset: resetInsights,
  } = useInsights();
  const { state: reportState, generate: generateReport } = useReport();

  const handleConsentAccepted = () => {
    generateInsights(result, businessType, qualityIssues);
  };

  const handleRetry = () => {
    resetInsights();
    requestConsent();
  };

  const handleDownloadPDF = () => {
    const businessLabel = BUSINESS_TYPE_OPTIONS.find(
      (o) => o.value === businessType
    )?.label ?? businessType;

    const reportData: ReportData = {
      title: "Laporan Analisis Bisnis",
      businessType: businessLabel,
      fileName,
      fileSize,
      analytics: result,
      insights: insightState.response ?? undefined,
      qualityIssues,
      isDemo: true, // TODO: integrate with payment in Phase 7
      generatedAt: new Date(),
    };
    generateReport(reportData);
  };

  return (
    <div className="space-y-6">
      {/* Consent Dialog */}
      {insightState.step === "requesting-consent" && (
        <ConsentDialog
          onAccept={handleConsentAccepted}
          onDecline={cancelConsent}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900">
              Hasil Analisis
            </h2>
            <p className="text-xs text-muted-foreground">
              {result.rowCount.toLocaleString("id-ID")} baris data dianalisis
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      </div>

      {/* Action Bar: PDF Download */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={reportState.step === "generating"}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
            reportState.step === "generating"
              ? "cursor-wait bg-muted text-muted-foreground"
              : reportState.step === "done"
                ? "bg-success/10 text-success"
                : "bg-navy-900 text-white hover:bg-navy-800"
          )}
        >
          {reportState.step === "generating" ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Membuat PDF...</>
          ) : reportState.step === "done" ? (
            <><CheckCircle2 className="h-4 w-4" />Terunduh!</>
          ) : (
            <><FileDown className="h-4 w-4" />Download Laporan PDF</>
          )}
        </button>
        {reportState.step === "error" && reportState.error && (
          <span className="text-xs text-danger">{reportState.error}</span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {result.kpis.map((kpi) => (
          <AnalyticsKPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* AI Insight CTA — show when no insights yet */}
      {insightState.step === "idle" && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-purple-200 bg-purple-50/50 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-navy-900">
                Dapatkan Insight AI
              </p>
              <p className="text-xs text-muted-foreground">
                AI akan menganalisis ringkasan data dan memberikan rekomendasi bisnis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              {BUSINESS_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={requestConsent}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
                "bg-purple-600 text-white hover:bg-purple-700"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Generate Insight
            </button>
          </div>
        </div>
      )}

      {/* AI Insight States */}
      {insightState.step === "loading" && <InsightLoading />}
      {insightState.step === "error" && insightState.error && (
        <InsightError error={insightState.error} onRetry={handleRetry} />
      )}
      {insightState.step === "done" && insightState.response && (
        <InsightPanel response={insightState.response} isDemo={true} />
      )}

      {/* Sales Trend Chart */}
      {result.availability.timeSeries && chartData.salesTrend.length > 0 && (
        <AnalyticsSalesChart
          data={chartData.salesTrend}
          title="Tren Penjualan"
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Product Ranking */}
        {result.availability.productRanking &&
          chartData.productRanking.length > 0 && (
            <AnalyticsProductChart
              data={chartData.productRanking}
              title="Produk Teratas"
            />
          )}

        {/* Category Breakdown */}
        {result.availability.categoryBreakdown &&
          chartData.categoryPie.length > 0 && (
            <AnalyticsCategoryChart
              data={chartData.categoryPie}
              title="Pendapatan per Kategori"
            />
          )}

        {/* Branch Breakdown */}
        {result.availability.branchBreakdown &&
          chartData.branchPie.length > 0 && (
            <AnalyticsCategoryChart
              data={chartData.branchPie}
              title="Pendapatan per Cabang"
            />
          )}
      </div>

      {/* Summary Tables */}
      {result.availability.productRanking && result.topProducts.length > 0 && (
        <AnalyticsSummaryTable
          items={result.topProducts}
          title="10 Produk Teratas"
          showQuantity={result.availability.quantity}
        />
      )}

      {result.availability.productRanking &&
        result.bottomProducts.length > 0 && (
          <AnalyticsSummaryTable
            items={result.bottomProducts}
            title="Produk Terendah"
            showQuantity={result.availability.quantity}
          />
        )}

      {result.availability.categoryBreakdown &&
        result.revenueByCategory.length > 0 && (
          <AnalyticsSummaryTable
            items={result.revenueByCategory}
            title="Pendapatan per Kategori"
            showQuantity={result.availability.quantity}
          />
        )}
    </div>
  );
}
