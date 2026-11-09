// ===========================================
// DataInsight Mini — Profile Engine
// ===========================================
// Orchestrates column profiling and quality checks.

import { PREVIEW_ROW_COUNT } from "@/lib/utils/constants";
import type {
  ParseResult,
  DataProfile,
  ColumnProfile,
  QualityIssue,
} from "../data-import/import-types";
import { detectColumnType } from "./type-detector";
import {
  checkMissingValues,
  checkDuplicateColumns,
  checkMissingHeaders,
  checkDuplicateRows,
} from "./quality-checker";

/**
 * Compute numeric statistics for a column.
 */
function computeNumericStats(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
} {
  if (values.length === 0) return { min: 0, max: 0, mean: 0, median: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    median,
  };
}

/**
 * Extract numeric values from a column's data.
 */
function extractNumericValues(values: unknown[]): number[] {
  const nums: number[] = [];
  for (const v of values) {
    if (typeof v === "number" && !isNaN(v)) {
      nums.push(v);
    } else if (typeof v === "string") {
      const cleaned = v
        .trim()
        .replace(/^Rp\s?/i, "")
        .replace(/\./g, "")
        .replace(/,/g, ".");
      const num = Number(cleaned);
      if (!isNaN(num) && cleaned !== "") {
        nums.push(num);
      }
    }
  }
  return nums;
}

/**
 * Profile a single column.
 */
function profileColumn(name: string, values: unknown[]): ColumnProfile {
  const totalCount = values.length;
  const nonNull = values.filter(
    (v) => v != null && (typeof v !== "string" || v.trim() !== "")
  );
  const nullCount = totalCount - nonNull.length;
  const uniqueValues = new Set(nonNull.map((v) => String(v)));
  const detectedType = detectColumnType(values);

  // Sample values (first 5 unique non-null)
  const sampleValues: unknown[] = [];
  const seenSamples = new Set<string>();
  for (const v of nonNull) {
    const key = String(v);
    if (!seenSamples.has(key) && sampleValues.length < 5) {
      seenSamples.add(key);
      sampleValues.push(v);
    }
  }

  const profile: ColumnProfile = {
    name,
    detectedType,
    totalCount,
    nonNullCount: nonNull.length,
    nullCount,
    uniqueCount: uniqueValues.size,
    sampleValues,
  };

  // Add numeric stats if numeric
  if (detectedType === "numeric") {
    const numericValues = extractNumericValues(values);
    if (numericValues.length > 0) {
      profile.numericStats = computeNumericStats(numericValues);
    }
  }

  return profile;
}

/**
 * Profile a parsed dataset.
 */
export function profileData(
  parseResult: ParseResult,
  rawHeaders?: string[]
): DataProfile {
  const { headers, rows, rowCount, columnCount } = parseResult;

  // Profile each column
  const columns: ColumnProfile[] = headers.map((header) => {
    const values = rows.map((row) => row[header]);
    return profileColumn(header, values);
  });

  // Quality checks
  const qualityIssues: QualityIssue[] = [];

  // Check duplicate columns (use raw headers if available)
  if (rawHeaders) {
    qualityIssues.push(...checkDuplicateColumns(rawHeaders));
    qualityIssues.push(...checkMissingHeaders(rawHeaders));
  }

  // Check missing values
  qualityIssues.push(...checkMissingValues(headers, rows));

  // Check duplicate rows
  const { duplicateCount, issue: dupIssue } = checkDuplicateRows(rows, headers);
  if (dupIssue) qualityIssues.push(dupIssue);

  // Preview rows
  const previewRows = rows.slice(0, PREVIEW_ROW_COUNT);

  return {
    fileName: "",
    fileSize: 0,
    rowCount,
    columnCount,
    columns,
    qualityIssues,
    previewRows,
    duplicateRowCount: duplicateCount,
    hasHeaders: true,
  };
}
