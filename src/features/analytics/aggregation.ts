// ===========================================
// DataInsight Mini — Aggregation Module
// ===========================================
// Group-by and frequency distribution utilities.

import type { ParsedRow } from "../data-import/import-types";
import type { FrequencyEntry } from "./analytics-types";

/**
 * Group rows by the string value of a column.
 * Skips rows where the column is null/empty.
 */
export function groupBy(
  rows: ParsedRow[],
  columnName: string
): Map<string, ParsedRow[]> {
  const groups = new Map<string, ParsedRow[]>();

  for (const row of rows) {
    const val = row[columnName];
    if (val == null || (typeof val === "string" && val.trim() === "")) continue;
    const key = String(val).trim();
    const group = groups.get(key);
    if (group) {
      group.push(row);
    } else {
      groups.set(key, [row]);
    }
  }

  return groups;
}

/**
 * Frequency distribution of a column's values.
 * Sorted by count descending.
 */
export function frequencyDistribution(
  rows: ParsedRow[],
  columnName: string
): FrequencyEntry[] {
  const groups = groupBy(rows, columnName);
  const total = rows.length;

  const entries: FrequencyEntry[] = [];
  for (const [value, groupRows] of groups) {
    entries.push({
      value,
      count: groupRows.length,
      percentage: total > 0 ? groupRows.length / total : 0,
    });
  }

  return entries.sort((a, b) => b.count - a.count);
}

/**
 * Sum a numeric column within each group.
 */
export function sumByGroup(
  rows: ParsedRow[],
  groupColumn: string,
  sumColumn: string
): Map<string, number> {
  const groups = groupBy(rows, groupColumn);
  const result = new Map<string, number>();

  for (const [key, groupRows] of groups) {
    let total = 0;
    for (const row of groupRows) {
      const val = row[sumColumn];
      if (val == null) continue;
      const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
      if (!isNaN(num)) total += num;
    }
    result.set(key, total);
  }

  return result;
}
