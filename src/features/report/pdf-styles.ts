// ===========================================
// DataInsight Mini — PDF Shared Styles
// ===========================================
// Reusable styles for @react-pdf/renderer.

import { StyleSheet } from "@react-pdf/renderer";

// ── Brand Colors ────────────────────────────────

export const colors = {
  navy: "#0f1b33",
  navyLight: "#1e3a5f",
  accent: "#2563eb",
  accentLight: "#dbeafe",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#64748b",
  mutedLight: "#94a3b8",
  border: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
  purple: "#7c3aed",
} as const;

// ── Base Styles ─────────────────────────────────

export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.navy,
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  // Headers
  h1: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 6,
  },
  h2: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 8,
    marginTop: 20,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  h3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 4,
    marginTop: 12,
  },
  // Text
  body: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.navy,
  },
  bodySmall: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.muted,
  },
  label: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  // Layout
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  spacer: {
    marginTop: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 10,
  },
  // Cards
  card: {
    backgroundColor: colors.bg,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Tables
  tableHeader: {
    flexDirection: "row" as const,
    backgroundColor: colors.navy,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  tableRow: {
    flexDirection: "row" as const,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    flexDirection: "row" as const,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  tableCell: {
    fontSize: 9,
    color: colors.navy,
  },
  tableCellMuted: {
    fontSize: 9,
    color: colors.muted,
  },
  // Badge
  badgeHigh: {
    backgroundColor: "#fef2f2",
    color: colors.danger,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeMedium: {
    backgroundColor: "#fffbeb",
    color: colors.warning,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeLow: {
    backgroundColor: colors.bg,
    color: colors.muted,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
});

// ── Helper: format Rupiah for PDF ───────────────

export function pdfRupiah(value: number): string {
  const prefix = value < 0 ? "-Rp" : "Rp";
  return (
    prefix +
    Math.abs(Math.round(value)).toLocaleString("id-ID")
  );
}

// ── Helper: format percentage for PDF ───────────

export function pdfPercent(value: number): string {
  return (value * 100).toFixed(1) + "%";
}

// ── Helper: format date Indonesian ──────────────

export function pdfDateID(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Helper: format file size ────────────────────

export function pdfFileSize(bytes: number): string {
  if (bytes >= 1_048_576) {
    return (bytes / 1_048_576).toFixed(1) + " MB";
  }
  return (bytes / 1024).toFixed(0) + " KB";
}
