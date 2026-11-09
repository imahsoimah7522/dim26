// ===========================================
// DataInsight Mini — PDF Report Document
// ===========================================
// Main document assembling all sections.

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ReportData } from "../report-types";
import { colors, baseStyles, pdfDateID } from "../pdf-styles";
import { CoverPage } from "./cover-page";
import {
  DatasetInfoSection,
  KPISection,
  RankingSection,
  SimpleBarChart,
  TrendSection,
  QualitySection,
  InsightsSection,
} from "./report-sections";

const s = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.mutedLight,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "10%",
    fontSize: 72,
    fontFamily: "Helvetica-Bold",
    color: "#f1f5f9",
    transform: "rotate(-30deg)",
  },
});

interface ReportDocumentProps {
  data: ReportData;
}

export function ReportDocument({ data }: ReportDocumentProps) {
  const {
    analytics,
    insights,
    qualityIssues,
    isDemo,
  } = data;

  // Build mapped columns list
  const mappedColumns: string[] = [];
  const mapping = analytics.mapping;
  const roleLabels: Record<string, string> = {
    date: "Tanggal",
    product: "Produk",
    revenue: "Pendapatan",
    quantity: "Kuantitas",
    category: "Kategori",
    branch: "Cabang",
  };
  for (const [role, col] of Object.entries(mapping)) {
    if (col) mappedColumns.push(`${roleLabels[role] ?? role}: ${col}`);
  }

  // Build category/branch chart data
  const categoryChartData = analytics.revenueByCategory.map((c) => ({
    name: c.name,
    value: c.revenue,
  }));
  const productChartData = analytics.topProducts.map((p) => ({
    name: p.name,
    value: p.revenue,
  }));

  return (
    <Document
      title={data.title}
      author="DataInsight Mini"
      subject="Laporan Analisis Data Bisnis"
      creator="DataInsight Mini"
    >
      {/* Cover Page */}
      <Page size="A4" style={{ ...baseStyles.page, paddingTop: 0, paddingBottom: 0 }}>
        <CoverPage
          title={data.title}
          businessName={data.businessName}
          businessType={data.businessType}
          fileName={data.fileName}
          generatedAt={data.generatedAt}
          isDemo={isDemo}
        />
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={baseStyles.page} wrap>
        {/* Demo watermark on content pages */}
        {isDemo && <Text style={s.watermark} fixed>DEMO</Text>}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>DataInsight Mini — Laporan Analisis</Text>
          <Text style={s.footerText}>
            {pdfDateID(data.generatedAt)}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} / ${totalPages}`
            }
          />
        </View>

        {/* 1. Dataset Info */}
        <DatasetInfoSection
          fileName={data.fileName}
          fileSize={data.fileSize}
          rowCount={analytics.rowCount}
          columnsMapped={mappedColumns}
        />

        {/* 2. KPI Overview */}
        <KPISection kpis={analytics.kpis} />

        {/* 3. Product Rankings (bar chart + table) */}
        {analytics.availability.productRanking && productChartData.length > 0 && (
          <View>
            <SimpleBarChart
              title="Produk Teratas"
              emoji="🏆"
              items={productChartData}
            />
            <RankingSection
              title="Detail Produk Teratas"
              emoji="📋"
              items={analytics.topProducts}
              showQuantity={analytics.availability.quantity}
            />
          </View>
        )}

        {/* 4. Bottom Products */}
        {analytics.availability.productRanking && analytics.bottomProducts.length > 0 && (
          <RankingSection
            title="Produk Terendah"
            emoji="📉"
            items={analytics.bottomProducts}
            showQuantity={analytics.availability.quantity}
          />
        )}

        {/* 5. Category Analysis */}
        {analytics.availability.categoryBreakdown && categoryChartData.length > 0 && (
          <View>
            <SimpleBarChart
              title="Pendapatan per Kategori"
              emoji="🏷️"
              items={categoryChartData}
            />
            <RankingSection
              title="Detail Kategori"
              emoji="📊"
              items={analytics.revenueByCategory}
              showQuantity={analytics.availability.quantity}
            />
          </View>
        )}

        {/* 6. Monthly Trend */}
        {analytics.availability.timeSeries && (
          <TrendSection monthlyTrend={analytics.monthlyTrend} />
        )}

        {/* 7. Data Quality */}
        <QualitySection issues={qualityIssues} />

        {/* 8. AI Insights */}
        {insights && <InsightsSection insights={insights} />}

        {/* Report Footer Note */}
        <View style={{ marginTop: 24 }}>
          <View style={baseStyles.divider} />
          <Text style={{ ...baseStyles.bodySmall, textAlign: "center", marginTop: 8 }}>
            Laporan ini dihasilkan secara otomatis oleh DataInsight Mini.
            {insights
              ? " Insight bisnis dihasilkan oleh AI berdasarkan ringkasan data."
              : ""}
            {"\n"}Selalu verifikasi hasil sebelum mengambil keputusan bisnis.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
