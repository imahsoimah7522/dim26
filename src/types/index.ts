// ===========================================
// DataInsight Mini — TypeScript Type Definitions
// ===========================================

/**
 * Tipe data kolom yang terdeteksi oleh Column Detector
 */
export type DetectedColumnType =
  | "numeric"
  | "date"
  | "categorical"
  | "text"
  | "unknown";

/**
 * Kategori mapping kolom yang dipilih user
 */
export type MappingCategory =
  | "date"
  | "metric"
  | "category"
  | "identifier"
  | "description"
  | "ignore";

/**
 * Metadata per kolom setelah deteksi
 */
export interface ColumnMeta {
  name: string;
  detectedType: DetectedColumnType;
  uniqueCount: number;
  nullCount: number;
  sampleValues: unknown[];
  suggestedMapping: MappingCategory;
}

/**
 * Mapping kolom yang dikonfirmasi user
 */
export interface ColumnMapping {
  [columnName: string]: MappingCategory;
}

/**
 * Metadata upload file
 */
export interface UploadMeta {
  fileName: string;
  fileSize: number;
  fileType: "xlsx" | "xls" | "csv";
  columnCount: number;
  rowCount: number;
  columns: ColumnMeta[];
  mapping: ColumnMapping | null;
}
