// ===========================================
// DataInsight Mini — Application Constants
// ===========================================

/** Ukuran file maksimal yang diperbolehkan (5 MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Jumlah baris maksimal yang diproses */
export const MAX_ROW_COUNT = 10_000;

/** Jumlah kolom maksimal yang diproses */
export const MAX_COLUMN_COUNT = 50;

/** Jumlah baris preview yang ditampilkan */
export const PREVIEW_ROW_COUNT = 20;

/** Jumlah baris sampel yang dikirim ke Gemini */
export const SAMPLE_ROW_COUNT = 5;

/** Tipe file yang diterima */
export const ACCEPTED_FILE_TYPES = [".xlsx", ".xls", ".csv"] as const;

/** MIME types yang diterima */
export const ACCEPTED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
] as const;

/** Expiry signed URL untuk report (dalam detik) */
export const REPORT_URL_EXPIRY_SECONDS = 3600; // 1 jam

/** Jumlah insight AI minimal per laporan */
export const MIN_INSIGHTS_COUNT = 3;

/** Jumlah insight AI maksimal per laporan */
export const MAX_INSIGHTS_COUNT = 5;

/** Kredit per tipe pembayaran */
export const PAYMENT_CREDITS = {
  single_report: 1,
  business_pack: 5,
} as const;

/** Harga dalam IDR */
export const PRICING_IDR = {
  single_report: 29_000,
  business_pack: 79_000,
} as const;

/** Threshold untuk auto-detect categorical (< N unique values) */
export const CATEGORICAL_THRESHOLD = 20;

/** Threshold untuk auto-detect numeric (> N% bisa di-parse sebagai angka) */
export const NUMERIC_THRESHOLD = 0.8;
