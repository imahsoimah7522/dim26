// ===========================================
// DataInsight Mini — Data Import Types
// ===========================================

import { z } from "zod/v4";

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = [".xlsx", ".csv"] as const;
export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

/** File validation result */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileName: string;
  fileSize: number;
  extension: SupportedExtension | null;
}

/** A single parsed row — keys are column names */
export type ParsedRow = Record<string, unknown>;

/** Result of parsing a file */
export interface ParseResult {
  success: boolean;
  error?: string;
  headers: string[];
  rows: ParsedRow[];
  sheetNames?: string[];
  selectedSheet?: string;
  rowCount: number;
  columnCount: number;
}

/** Detected column type */
export type DetectedColumnType =
  | "numeric"
  | "date"
  | "categorical"
  | "text"
  | "boolean"
  | "empty"
  | "unknown";

/** Column profile from profiling engine */
export interface ColumnProfile {
  name: string;
  detectedType: DetectedColumnType;
  totalCount: number;
  nonNullCount: number;
  nullCount: number;
  uniqueCount: number;
  sampleValues: unknown[];
  /** Only for numeric columns */
  numericStats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
}

/** Data quality issue */
export interface QualityIssue {
  type: "missing_values" | "duplicate_rows" | "duplicate_columns" | "missing_headers";
  severity: "warning" | "error";
  message: string;
  details?: string;
  affectedCount?: number;
}

/** Full data profile */
export interface DataProfile {
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  qualityIssues: QualityIssue[];
  previewRows: ParsedRow[];
  duplicateRowCount: number;
  hasHeaders: boolean;
}

/** Import state for UI */
export type ImportStep = "idle" | "validating" | "parsing" | "profiling" | "ready" | "error";

export interface ImportState {
  step: ImportStep;
  file: File | null;
  parseResult: ParseResult | null;
  profile: DataProfile | null;
  error: string | null;
  /** Available sheets for XLSX files */
  availableSheets: string[];
  selectedSheet: string | null;
}

/** Zod schema for import limits validation */
export const importLimitsSchema = z.object({
  fileSize: z.number().max(5 * 1024 * 1024, "Ukuran file melebihi 5 MB"),
  rowCount: z.number().max(10_000, "Jumlah baris melebihi 10.000"),
  columnCount: z.number().max(50, "Jumlah kolom melebihi 50"),
});
