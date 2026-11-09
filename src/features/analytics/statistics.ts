// ===========================================
// DataInsight Mini — Statistics Module
// ===========================================
// Pure deterministic statistical functions.
// No side effects, no AI.

import type { DescriptiveStats } from "./analytics-types";

/**
 * Extract numeric values from an array of unknown values.
 * Handles: number, numeric string, Rupiah-formatted string.
 * Skips: null, undefined, empty string, NaN.
 */
export function extractNumbers(values: unknown[]): number[] {
  const nums: number[] = [];
  for (const v of values) {
    if (v == null) continue;
    if (typeof v === "number") {
      if (!isNaN(v)) nums.push(v);
      continue;
    }
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed === "") continue;

      // Check if Rupiah-formatted (e.g. "Rp 1.000.000" or "Rp1.500")
      const isRupiah = /^Rp\s?/i.test(trimmed);
      // Check if Indonesian thousand-separator format: digits with dots
      // as thousand separators and optional comma as decimal separator.
      // Pattern: digits grouped by dots, optional comma + decimals.
      // e.g. "1.000.000" or "1.500,50"
      const isIdFormat = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(
        trimmed.replace(/^Rp\s?/i, "")
      );

      let cleaned: string;
      if (isRupiah || isIdFormat) {
        // Indonesian format: dots are thousand separators, comma is decimal
        cleaned = trimmed
          .replace(/^Rp\s?/i, "")
          .replace(/\./g, "")
          .replace(/,/g, ".");
      } else {
        // Standard format: dots are decimal points
        cleaned = trimmed;
      }

      const num = Number(cleaned);
      if (!isNaN(num)) nums.push(num);
    }
  }
  return nums;
}

/**
 * Count of values (including nulls).
 */
export function count(values: unknown[]): number {
  return values.length;
}

/**
 * Count of non-null, non-empty values.
 */
export function countNonNull(values: unknown[]): number {
  return values.filter(
    (v) => v != null && (typeof v !== "string" || v.trim() !== "")
  ).length;
}

/**
 * Sum of numeric values.
 */
export function sum(values: unknown[]): number {
  return extractNumbers(values).reduce((acc, n) => acc + n, 0);
}

/**
 * Arithmetic mean of numeric values.
 */
export function mean(values: unknown[]): number {
  const nums = extractNumbers(values);
  if (nums.length === 0) return 0;
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

/**
 * Median of numeric values.
 */
export function median(values: unknown[]): number {
  const nums = extractNumbers(values).sort((a, b) => a - b);
  if (nums.length === 0) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 === 0
    ? (nums[mid - 1] + nums[mid]) / 2
    : nums[mid];
}

/**
 * Minimum of numeric values.
 */
export function min(values: unknown[]): number {
  const nums = extractNumbers(values);
  if (nums.length === 0) return 0;
  return Math.min(...nums);
}

/**
 * Maximum of numeric values.
 */
export function max(values: unknown[]): number {
  const nums = extractNumbers(values);
  if (nums.length === 0) return 0;
  return Math.max(...nums);
}

/**
 * Population standard deviation.
 */
export function stdDev(values: unknown[]): number {
  const nums = extractNumbers(values);
  if (nums.length === 0) return 0;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const squaredDiffs = nums.map((n) => (n - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / nums.length);
}

/**
 * Count of unique non-null values.
 */
export function uniqueCount(values: unknown[]): number {
  const nonNull = values.filter(
    (v) => v != null && (typeof v !== "string" || v.trim() !== "")
  );
  return new Set(nonNull.map(String)).size;
}

/**
 * Full descriptive statistics for a set of values.
 */
export function describe(values: unknown[]): DescriptiveStats {
  const nums = extractNumbers(values);
  if (nums.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  }

  const sorted = [...nums].sort((a, b) => a - b);
  const total = sorted.reduce((a, b) => a + b, 0);
  const avg = total / sorted.length;
  const mid = Math.floor(sorted.length / 2);
  const med = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  const sqDiffs = sorted.map((n) => (n - avg) ** 2);
  const sd = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / sorted.length);

  return {
    count: sorted.length,
    sum: total,
    mean: avg,
    median: med,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev: sd,
  };
}
