// ===========================================
// DataInsight Mini — Quality Checker
// ===========================================
// Checks data quality: missing values, duplicates, header issues.

import type { ParsedRow, QualityIssue } from "../data-import/import-types";

/**
 * Check for missing/null values in each column.
 */
export function checkMissingValues(
  headers: string[],
  rows: ParsedRow[]
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const totalRows = rows.length;

  for (const header of headers) {
    let nullCount = 0;
    for (const row of rows) {
      const val = row[header];
      if (val == null || (typeof val === "string" && val.trim() === "")) {
        nullCount++;
      }
    }

    if (nullCount > 0) {
      const pct = ((nullCount / totalRows) * 100).toFixed(1);
      issues.push({
        type: "missing_values",
        severity: nullCount === totalRows ? "error" : "warning",
        message: `Kolom "${header}" memiliki ${nullCount} nilai kosong (${pct}%).`,
        details: header,
        affectedCount: nullCount,
      });
    }
  }

  return issues;
}

/**
 * Check for duplicate column names (before deduplication).
 */
export function checkDuplicateColumns(rawHeaders: string[]): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const seen = new Map<string, number>();

  for (const h of rawHeaders) {
    const normalized = h.trim().toLowerCase();
    seen.set(normalized, (seen.get(normalized) ?? 0) + 1);
  }

  for (const [name, count] of seen) {
    if (count > 1) {
      issues.push({
        type: "duplicate_columns",
        severity: "warning",
        message: `Nama kolom "${name}" muncul ${count} kali. Kolom duplikat telah diberi nama unik.`,
        affectedCount: count,
      });
    }
  }

  return issues;
}

/**
 * Check for missing or empty headers.
 */
export function checkMissingHeaders(rawHeaders: string[]): QualityIssue[] {
  const emptyCount = rawHeaders.filter(
    (h) => h == null || String(h).trim() === ""
  ).length;

  if (emptyCount > 0) {
    return [
      {
        type: "missing_headers",
        severity: "warning",
        message: `${emptyCount} kolom tidak memiliki nama header. Nama default "Kolom" telah diberikan.`,
        affectedCount: emptyCount,
      },
    ];
  }
  return [];
}

/**
 * Check for duplicate rows.
 * Returns count of duplicate rows (rows that appear more than once).
 */
export function checkDuplicateRows(
  rows: ParsedRow[],
  headers: string[]
): { duplicateCount: number; issue: QualityIssue | null } {
  const seen = new Map<string, number>();

  for (const row of rows) {
    // Create a stable key from all column values
    const key = headers.map((h) => String(row[h] ?? "")).join("\t");
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  let duplicateCount = 0;
  for (const count of seen.values()) {
    if (count > 1) {
      duplicateCount += count - 1;
    }
  }

  if (duplicateCount > 0) {
    return {
      duplicateCount,
      issue: {
        type: "duplicate_rows",
        severity: "warning",
        message: `Ditemukan ${duplicateCount} baris duplikat dari ${rows.length} total baris.`,
        affectedCount: duplicateCount,
      },
    };
  }

  return { duplicateCount: 0, issue: null };
}
