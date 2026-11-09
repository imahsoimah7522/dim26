// ===========================================
// DataInsight Mini — Format Utilities
// ===========================================

/**
 * Format angka ke format Rupiah Indonesia.
 * @example formatRupiah(1500000) → "Rp1.500.000"
 */
export function formatRupiah(value: number): string {
  const prefix = value < 0 ? "-Rp" : "Rp";
  const absValue = Math.abs(value);

  return prefix + absValue.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format angka ke persentase dengan format Indonesia.
 * @example formatPercentage(0.1567) → "15,67%"
 */
export function formatPercentage(value: number, decimals = 2): string {
  return (value * 100).toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + "%";
}

/**
 * Format tanggal ke format Indonesia.
 * @example formatDateID("2024-01-15") → "15 Januari 2024"
 */
export function formatDateID(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format angka besar ke bentuk compact.
 * @example formatCompact(1500000) → "1,5 jt"
 */
export function formatCompact(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000_000) {
    return sign + (absValue / 1_000_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " T";
  }
  if (absValue >= 1_000_000_000) {
    return sign + (absValue / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " M";
  }
  if (absValue >= 1_000_000) {
    return sign + (absValue / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
  }
  if (absValue >= 1_000) {
    return sign + (absValue / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " rb";
  }
  return sign + absValue.toLocaleString("id-ID");
}
