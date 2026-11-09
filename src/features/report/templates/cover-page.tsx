// ===========================================
// DataInsight Mini — PDF Cover Page
// ===========================================

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { colors, pdfDateID } from "../pdf-styles";

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  brandBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 40,
  },
  metaBox: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 20,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 9,
    color: colors.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
  },
  metaValue: {
    fontSize: 9,
    color: colors.navy,
  },
  brand: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    textAlign: "center",
    marginTop: 40,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "15%",
    fontSize: 60,
    fontFamily: "Helvetica-Bold",
    color: "#e2e8f0",
    transform: "rotate(-30deg)",
    opacity: 0.5,
  },
});

interface CoverPageProps {
  title: string;
  businessName?: string;
  businessType: string;
  fileName: string;
  generatedAt: Date;
  isDemo: boolean;
}

export function CoverPage({
  title,
  businessName,
  businessType,
  fileName,
  generatedAt,
  isDemo,
}: CoverPageProps) {
  return (
    <View style={s.container}>
      {isDemo && <Text style={s.watermark}>DEMO</Text>}

      <View style={s.brandBar} />
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>Laporan Analisis Data Bisnis</Text>

      <View style={s.metaBox}>
        {businessName && (
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>Bisnis</Text>
            <Text style={s.metaValue}>{businessName}</Text>
          </View>
        )}
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Jenis</Text>
          <Text style={s.metaValue}>{businessType}</Text>
        </View>
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Sumber Data</Text>
          <Text style={s.metaValue}>{fileName}</Text>
        </View>
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Tanggal</Text>
          <Text style={s.metaValue}>{pdfDateID(generatedAt)}</Text>
        </View>
      </View>

      <Text style={s.brand}>DataInsight Mini</Text>
    </View>
  );
}
