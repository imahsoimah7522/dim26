// ===========================================
// DataInsight Mini — Type Detector
// ===========================================
// Detects column data types from sample values.

import type { DetectedColumnType } from "../data-import/import-types";

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,                    // 2024-01-15
  /^\d{2}\/\d{2}\/\d{4}$/,                  // 15/01/2024
  /^\d{2}-\d{2}-\d{4}$/,                    // 15-01-2024
  /^\d{4}\/\d{2}\/\d{2}$/,                  // 2024/01/15
  /^\d{1,2}\s\w+\s\d{4}$/,                  // 15 Januari 2024
];

/**
 * Check if a value looks like a date.
 */
function isDateLike(value: unknown): boolean {
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return false;
  // Check known patterns
  if (DATE_PATTERNS.some((p) => p.test(trimmed))) return true;
  // Try parsing as date — only accept if it has date-like separators
  if (/[-/]/.test(trimmed)) {
    const d = new Date(trimmed);
    return !isNaN(d.getTime());
  }
  return false;
}

/**
 * Check if a value is numeric.
 */
function isNumericValue(value: unknown): boolean {
  if (typeof value === "number") return !isNaN(value);
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return false;
  // Remove common number formatting: Rp, dots as thousands, commas as decimals
  const cleaned = trimmed
    .replace(/^Rp\s?/i, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  return !isNaN(Number(cleaned)) && cleaned !== "";
}

/**
 * Check if a value is boolean-like.
 */
function isBooleanValue(value: unknown): boolean {
  if (typeof value === "boolean") return true;
  if (typeof value !== "string") return false;
  const lower = value.trim().toLowerCase();
  return ["true", "false", "ya", "tidak", "yes", "no", "1", "0"].includes(lower);
}

/**
 * Detect the type of a column from its values.
 */
export function detectColumnType(values: unknown[]): DetectedColumnType {
  const nonNull = values.filter(
    (v) => v != null && (typeof v !== "string" || v.trim() !== "")
  );

  if (nonNull.length === 0) return "empty";

  const total = nonNull.length;
  let dateCount = 0;
  let numericCount = 0;
  let booleanCount = 0;

  for (const v of nonNull) {
    if (isDateLike(v)) dateCount++;
    if (isNumericValue(v)) numericCount++;
    if (isBooleanValue(v)) booleanCount++;
  }

  const threshold = 0.8;

  // Check date first (dates can also parse as numbers sometimes)
  if (dateCount / total >= threshold) return "date";

  // Check boolean
  if (booleanCount / total >= threshold) return "boolean";

  // Check numeric
  if (numericCount / total >= threshold) return "numeric";

  // Determine categorical vs text by unique count
  const uniqueValues = new Set(nonNull.map((v) => String(v).trim().toLowerCase()));
  if (uniqueValues.size <= 20 && uniqueValues.size < total * 0.5) {
    return "categorical";
  }

  return "text";
}
