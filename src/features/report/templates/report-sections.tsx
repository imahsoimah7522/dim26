// ===========================================
// DataInsight Mini — PDF Content Sections
// ===========================================
// Reusable sections for the report body.

import { View, Text, Svg, Rect, StyleSheet } from "@react-pdf/renderer";
import type { KPIResult, RankedItem, MonthlyEntry } from "@/features/analytics/analytics-types";
import type { QualityIssue } from "@/features/data-import/import-types";
import type { InsightResponse } from "@/features/ai-insights/insight-types";
import {
  colors,
  baseStyles,
  pdfRupiah,
  pdfPercent,
  pdfFileSize,
} from "../pdf-styles";

const s = StyleSheet.create({
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: colors.bg,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: {
    fontSize: 8,
    color: colors.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  kpiUnavailable: {
    fontSize: 8,
    color: colors.mutedLight,
    fontStyle: "italic",
    marginTop: 2,
  },
  chartContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  barLabel: {
    width: 120,
    fontSize: 8,
    color: colors.navy,
  },
  barValueLabel: {
    fontSize: 8,
    color: colors.muted,
    marginLeft: 6,
  },
  insightCard: {
    backgroundColor: colors.bg,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 3,
  },
  insightBody: {
    fontSize: 9,
    color: colors.navy,
    lineHeight: 1.5,
  },
  insightEvidence: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 3,
    fontStyle: "italic",
  },
  qualityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
});

// ── Dataset Info Section ────────────────────────

interface DatasetInfoProps {
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnsMapped: string[];
}

export function DatasetInfoSection({
  fileName,
  fileSize,
  rowCount,
  columnsMapped,
}: DatasetInfoProps) {
  return (
    <View>
      <Text style={baseStyles.h2}>📊 Informasi Dataset</Text>
      <View style={baseStyles.card}>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ ...baseStyles.bodySmall, width: 120 }}>File:</Text>
          <Text style={baseStyles.body}>{fileName}</Text>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ ...baseStyles.bodySmall, width: 120 }}>Ukuran:</Text>
          <Text style={baseStyles.body}>{pdfFileSize(fileSize)}</Text>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ ...baseStyles.bodySmall, width: 120 }}>Jumlah Baris:</Text>
          <Text style={baseStyles.body}>{rowCount.toLocaleString("id-ID")}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ ...baseStyles.bodySmall, width: 120 }}>Kolom Dipetakan:</Text>
          <Text style={baseStyles.body}>
            {columnsMapped.length > 0 ? columnsMapped.join(", ") : "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── KPI Section ─────────────────────────────────

interface KPISectionProps {
  kpis: KPIResult[];
}

export function KPISection({ kpis }: KPISectionProps) {
  return (
    <View>
      <Text style={baseStyles.h2}>📈 Ringkasan KPI</Text>
      <View style={s.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={s.kpiCard}>
            <Text style={s.kpiLabel}>{kpi.label}</Text>
            <Text style={s.kpiValue}>
              {kpi.available ? kpi.formattedValue : "—"}
            </Text>
            {!kpi.available && kpi.unavailableReason && (
              <Text style={s.kpiUnavailable}>{kpi.unavailableReason}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Product Ranking Section ─────────────────────

interface RankingSectionProps {
  title: string;
  emoji: string;
  items: RankedItem[];
  showQuantity: boolean;
}

export function RankingSection({
  title,
  emoji,
  items,
  showQuantity,
}: RankingSectionProps) {
  if (items.length === 0) return null;

  return (
    <View>
      <Text style={baseStyles.h2}>
        {emoji} {title}
      </Text>
      {/* Table header */}
      <View style={baseStyles.tableHeader}>
        <Text style={{ ...baseStyles.tableHeaderText, width: 30 }}>#</Text>
        <Text style={{ ...baseStyles.tableHeaderText, flex: 1 }}>Nama</Text>
        <Text style={{ ...baseStyles.tableHeaderText, width: 100, textAlign: "right" }}>
          Pendapatan
        </Text>
        {showQuantity && (
          <Text style={{ ...baseStyles.tableHeaderText, width: 50, textAlign: "right" }}>
            Qty
          </Text>
        )}
        <Text style={{ ...baseStyles.tableHeaderText, width: 50, textAlign: "right" }}>
          %
        </Text>
      </View>
      {/* Table rows */}
      {items.map((item, i) => (
        <View key={item.name} style={i % 2 === 0 ? baseStyles.tableRow : baseStyles.tableRowAlt}>
          <Text style={{ ...baseStyles.tableCell, width: 30 }}>{i + 1}</Text>
          <Text style={{ ...baseStyles.tableCell, flex: 1 }}>{item.name}</Text>
          <Text style={{ ...baseStyles.tableCell, width: 100, textAlign: "right" }}>
            {pdfRupiah(item.revenue)}
          </Text>
          {showQuantity && (
            <Text style={{ ...baseStyles.tableCell, width: 50, textAlign: "right" }}>
              {item.quantity.toLocaleString("id-ID")}
            </Text>
          )}
          <Text style={{ ...baseStyles.tableCellMuted, width: 50, textAlign: "right" }}>
            {pdfPercent(item.percentage)}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Bar Chart (Simple) ──────────────────────────

interface SimpleBarChartProps {
  title: string;
  emoji: string;
  items: { name: string; value: number }[];
  maxBars?: number;
}

export function SimpleBarChart({
  title,
  emoji,
  items,
  maxBars = 10,
}: SimpleBarChartProps) {
  if (items.length === 0) return null;

  const display = items.slice(0, maxBars);
  const maxValue = Math.max(...display.map((d) => d.value), 1);
  const barMaxWidth = 280;

  return (
    <View>
      <Text style={baseStyles.h2}>
        {emoji} {title}
      </Text>
      <View style={s.chartContainer}>
        {display.map((item) => {
          const barWidth = Math.max((item.value / maxValue) * barMaxWidth, 2);
          return (
            <View key={item.name} style={s.barRow}>
              <Text style={s.barLabel}>
                {item.name.length > 18 ? item.name.slice(0, 17) + "…" : item.name}
              </Text>
              <Svg width={barMaxWidth + 10} height={14}>
                <Rect x={0} y={2} width={barWidth} height={10} rx={3} fill={colors.accent} />
              </Svg>
              <Text style={s.barValueLabel}>{pdfRupiah(item.value)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Monthly Trend Section ───────────────────────

interface TrendSectionProps {
  monthlyTrend: MonthlyEntry[];
}

export function TrendSection({ monthlyTrend }: TrendSectionProps) {
  if (monthlyTrend.length === 0) return null;

  return (
    <View>
      <Text style={baseStyles.h2}>📅 Tren Penjualan Bulanan</Text>
      <View style={baseStyles.tableHeader}>
        <Text style={{ ...baseStyles.tableHeaderText, width: 80 }}>Bulan</Text>
        <Text style={{ ...baseStyles.tableHeaderText, flex: 1, textAlign: "right" }}>
          Pendapatan
        </Text>
        <Text style={{ ...baseStyles.tableHeaderText, width: 60, textAlign: "right" }}>
          Qty
        </Text>
        <Text style={{ ...baseStyles.tableHeaderText, width: 60, textAlign: "right" }}>
          Transaksi
        </Text>
      </View>
      {monthlyTrend.map((m, i) => (
        <View key={m.month} style={i % 2 === 0 ? baseStyles.tableRow : baseStyles.tableRowAlt}>
          <Text style={{ ...baseStyles.tableCell, width: 80 }}>{m.monthLabel}</Text>
          <Text style={{ ...baseStyles.tableCell, flex: 1, textAlign: "right" }}>
            {pdfRupiah(m.revenue)}
          </Text>
          <Text style={{ ...baseStyles.tableCell, width: 60, textAlign: "right" }}>
            {m.quantity.toLocaleString("id-ID")}
          </Text>
          <Text style={{ ...baseStyles.tableCell, width: 60, textAlign: "right" }}>
            {m.transactionCount.toLocaleString("id-ID")}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Quality Section ─────────────────────────────

interface QualitySectionProps {
  issues: QualityIssue[];
}

export function QualitySection({ issues }: QualitySectionProps) {
  if (issues.length === 0) {
    return (
      <View>
        <Text style={baseStyles.h2}>✅ Kualitas Data</Text>
        <Text style={baseStyles.body}>
          Tidak ada masalah kualitas data yang ditemukan.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={baseStyles.h2}>⚠️ Kualitas Data</Text>
      {issues.map((issue, i) => (
        <View key={`q-${i}`} style={s.qualityItem}>
          <View
            style={{
              ...s.qualityDot,
              backgroundColor: issue.severity === "error" ? colors.danger : colors.warning,
            }}
          />
          <Text style={{ ...baseStyles.body, flex: 1 }}>{issue.message}</Text>
        </View>
      ))}
    </View>
  );
}

// ── AI Insights Section ─────────────────────────

interface InsightsSectionProps {
  insights: InsightResponse;
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <View>
      {/* Executive Summary */}
      <Text style={baseStyles.h2}>🤖 Ringkasan AI</Text>
      <View style={{ ...baseStyles.card, borderLeftWidth: 3, borderLeftColor: colors.purple }}>
        <Text style={baseStyles.body}>{insights.executiveSummary}</Text>
      </View>

      {/* Key Findings */}
      {insights.keyFindings.length > 0 && (
        <View>
          <Text style={baseStyles.h3}>Temuan Utama</Text>
          {insights.keyFindings.map((f, i) => (
            <View key={`f-${i}`} style={s.insightCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={s.insightTitle}>{f.title}</Text>
                <Text style={
                  f.importance === "high"
                    ? baseStyles.badgeHigh
                    : f.importance === "medium"
                      ? baseStyles.badgeMedium
                      : baseStyles.badgeLow
                }>
                  {f.importance === "high" ? "TINGGI" : f.importance === "medium" ? "SEDANG" : "RENDAH"}
                </Text>
              </View>
              <Text style={s.insightBody}>{f.observation}</Text>
              <Text style={s.insightEvidence}>Bukti: {f.evidence}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Risks */}
      {insights.businessRisks.length > 0 && (
        <View>
          <Text style={baseStyles.h3}>Risiko Bisnis</Text>
          {insights.businessRisks.map((r, i) => (
            <View key={`r-${i}`} style={s.insightCard}>
              <Text style={s.insightTitle}>{r.title}</Text>
              <Text style={s.insightBody}>{r.description}</Text>
              <Text style={{ ...s.insightEvidence, color: colors.accent }}>
                Saran: {r.suggestedAction}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <View>
          <Text style={baseStyles.h2}>💡 Rekomendasi</Text>
          {insights.recommendations.map((rec, i) => (
            <View key={`rec-${i}`} style={s.insightCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={s.insightTitle}>{rec.title}</Text>
                <Text style={
                  rec.priority === "high"
                    ? baseStyles.badgeHigh
                    : rec.priority === "medium"
                      ? baseStyles.badgeMedium
                      : baseStyles.badgeLow
                }>
                  {rec.priority === "high" ? "PRIORITAS" : rec.priority === "medium" ? "SEDANG" : "RENDAH"}
                </Text>
              </View>
              <Text style={s.insightBody}>{rec.description}</Text>
              <Text style={{ ...s.insightEvidence, color: colors.success }}>
                Dampak: {rec.expectedImpact}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Limitations */}
      {insights.limitations.length > 0 && (
        <View>
          <Text style={baseStyles.h2}>📝 Keterbatasan Analisis</Text>
          {insights.limitations.map((lim, i) => (
            <View key={`lim-${i}`} style={s.qualityItem}>
              <View style={{ ...s.qualityDot, backgroundColor: colors.mutedLight }} />
              <Text style={{ ...baseStyles.bodySmall, flex: 1 }}>{lim.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
