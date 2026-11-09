// ===========================================
// DataInsight Mini — Date Analysis Module
// ===========================================
// Parse dates and aggregate by time period.

import type { ParsedRow } from "../data-import/import-types";
import type { MonthlyEntry, DailyEntry } from "./analytics-types";
import { extractNumbers } from "./statistics";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/**
 * Try to parse a value as a Date.
 * Returns null if unparseable or invalid.
 */
export function parseDate(value: unknown): Date | null {
  if (value == null) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    // Excel serial date number
    if (value > 25569 && value < 60000) {
      const d = new Date((value - 25569) * 86400000);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed === "") return null;

  // Try DD/MM/YYYY
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const d = new Date(
      Number(ddmmyyyy[3]),
      Number(ddmmyyyy[2]) - 1,
      Number(ddmmyyyy[1])
    );
    return isNaN(d.getTime()) ? null : d;
  }

  // Try YYYY-MM-DD or ISO
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a Date as "YYYY-MM".
 */
function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Format a Date as "YYYY-MM-DD".
 */
function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Format "YYYY-MM" to "Jan 2024" label.
 */
function monthKeyToLabel(key: string): string {
  const [yearStr, monthStr] = key.split("-");
  const monthIndex = Number(monthStr) - 1;
  return `${MONTH_NAMES[monthIndex]} ${yearStr}`;
}

/**
 * Aggregate rows by month.
 */
export function aggregateByMonth(
  rows: ParsedRow[],
  dateColumn: string,
  revenueColumn?: string,
  quantityColumn?: string
): MonthlyEntry[] {
  const buckets = new Map<
    string,
    { revenue: number; quantity: number; count: number }
  >();

  for (const row of rows) {
    const d = parseDate(row[dateColumn]);
    if (!d) continue;

    const key = toMonthKey(d);
    const bucket = buckets.get(key) ?? { revenue: 0, quantity: 0, count: 0 };

    bucket.count++;

    if (revenueColumn) {
      const nums = extractNumbers([row[revenueColumn]]);
      if (nums.length > 0) bucket.revenue += nums[0];
    }

    if (quantityColumn) {
      const nums = extractNumbers([row[quantityColumn]]);
      if (nums.length > 0) bucket.quantity += nums[0];
    }

    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      month: key,
      monthLabel: monthKeyToLabel(key),
      revenue: data.revenue,
      quantity: data.quantity,
      transactionCount: data.count,
    }));
}

/**
 * Aggregate rows by day.
 */
export function aggregateByDay(
  rows: ParsedRow[],
  dateColumn: string,
  revenueColumn?: string,
  quantityColumn?: string
): DailyEntry[] {
  const buckets = new Map<
    string,
    { revenue: number; quantity: number; count: number }
  >();

  for (const row of rows) {
    const d = parseDate(row[dateColumn]);
    if (!d) continue;

    const key = toDayKey(d);
    const bucket = buckets.get(key) ?? { revenue: 0, quantity: 0, count: 0 };

    bucket.count++;

    if (revenueColumn) {
      const nums = extractNumbers([row[revenueColumn]]);
      if (nums.length > 0) bucket.revenue += nums[0];
    }

    if (quantityColumn) {
      const nums = extractNumbers([row[quantityColumn]]);
      if (nums.length > 0) bucket.quantity += nums[0];
    }

    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      date: key,
      revenue: data.revenue,
      quantity: data.quantity,
      transactionCount: data.count,
    }));
}
