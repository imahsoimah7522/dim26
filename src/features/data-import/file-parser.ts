// ===========================================
// DataInsight Mini — File Parser
// ===========================================
// Parses XLSX and CSV files using SheetJS.
// All processing happens in the browser.

import * as XLSX from "xlsx";
import type { ParseResult, ParsedRow } from "./import-types";

/**
 * Deduplicate header names by appending _2, _3, etc.
 */
function deduplicateHeaders(headers: string[]): string[] {
  const counts = new Map<string, number>();
  return headers.map((h) => {
    const name = h.trim() || "Kolom";
    const count = counts.get(name) ?? 0;
    counts.set(name, count + 1);
    if (count === 0) return name;
    return `${name}_${count + 1}`;
  });
}

/**
 * Parse an ArrayBuffer into rows using SheetJS.
 */
function parseWorkbook(
  workbook: XLSX.WorkBook,
  sheetName?: string
): ParseResult {
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    return {
      success: false,
      error: "File tidak memiliki worksheet.",
      headers: [],
      rows: [],
      sheetNames: [],
      rowCount: 0,
      columnCount: 0,
    };
  }

  const selectedSheet = sheetName ?? sheetNames[0];
  const worksheet = workbook.Sheets[selectedSheet];

  if (!worksheet) {
    return {
      success: false,
      error: `Worksheet "${selectedSheet}" tidak ditemukan.`,
      headers: [],
      rows: [],
      sheetNames,
      rowCount: 0,
      columnCount: 0,
    };
  }

  // Convert to array of arrays to detect headers
  const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: null,
    blankrows: false,
  });

  if (rawData.length === 0) {
    return {
      success: false,
      error: "Worksheet tidak memiliki data.",
      headers: [],
      rows: [],
      sheetNames,
      selectedSheet,
      rowCount: 0,
      columnCount: 0,
    };
  }

  // First row = headers
  const rawHeaders = (rawData[0] as unknown[]).map((h) =>
    h != null ? String(h).trim() : ""
  );
  const headers = deduplicateHeaders(rawHeaders);

  // Remaining rows = data
  const dataRows = rawData.slice(1);
  const rows: ParsedRow[] = dataRows.map((rawRow) => {
    const row: ParsedRow = {};
    const cells = rawRow as unknown[];
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = i < cells.length ? cells[i] : null;
    }
    return row;
  });

  return {
    success: true,
    headers,
    rows,
    sheetNames,
    selectedSheet,
    rowCount: rows.length,
    columnCount: headers.length,
  };
}

/**
 * Parse an XLSX file from an ArrayBuffer.
 */
export function parseXlsx(
  buffer: ArrayBuffer,
  sheetName?: string
): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    return parseWorkbook(workbook, sheetName);
  } catch {
    return {
      success: false,
      error: "Gagal membaca file Excel. Pastikan file tidak rusak.",
      headers: [],
      rows: [],
      rowCount: 0,
      columnCount: 0,
    };
  }
}

/**
 * Parse a CSV file from an ArrayBuffer.
 */
export function parseCsv(buffer: ArrayBuffer): ParseResult {
  try {
    const text = new TextDecoder("utf-8").decode(buffer);
    const workbook = XLSX.read(text, { type: "string", cellDates: true });
    return parseWorkbook(workbook);
  } catch {
    return {
      success: false,
      error: "Gagal membaca file CSV. Pastikan format file benar.",
      headers: [],
      rows: [],
      rowCount: 0,
      columnCount: 0,
    };
  }
}

/**
 * Parse a file (auto-detect format from extension).
 */
export async function parseFile(
  file: File,
  extension: ".xlsx" | ".csv",
  sheetName?: string
): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();

  if (extension === ".xlsx") {
    return parseXlsx(buffer, sheetName);
  }
  return parseCsv(buffer);
}

/**
 * Get list of sheet names from an XLSX file.
 */
export function getSheetNames(buffer: ArrayBuffer): string[] {
  try {
    const workbook = XLSX.read(buffer, { type: "array", bookSheets: true });
    return workbook.SheetNames;
  } catch {
    return [];
  }
}
