// ===========================================
// DataInsight Mini — Quality Checker Tests
// ===========================================

import { describe, it, expect } from "vitest";
import {
  checkMissingValues,
  checkDuplicateColumns,
  checkMissingHeaders,
  checkDuplicateRows,
} from "@/features/data-profiling/quality-checker";
import type { ParsedRow } from "@/features/data-import/import-types";

describe("checkMissingValues", () => {
  it("detects missing values", () => {
    const headers = ["Nama", "Umur"];
    const rows: ParsedRow[] = [
      { Nama: "Andi", Umur: 25 },
      { Nama: null, Umur: 30 },
      { Nama: "Citra", Umur: null },
    ];
    const issues = checkMissingValues(headers, rows);
    expect(issues).toHaveLength(2);
    expect(issues[0].type).toBe("missing_values");
    expect(issues[0].affectedCount).toBe(1);
  });

  it("detects empty string as missing", () => {
    const rows: ParsedRow[] = [
      { Nama: "", Umur: 25 },
      { Nama: "   ", Umur: 30 },
    ];
    const issues = checkMissingValues(["Nama", "Umur"], rows);
    const namaIssue = issues.find((i) => i.details === "Nama");
    expect(namaIssue).toBeDefined();
    expect(namaIssue!.affectedCount).toBe(2);
  });

  it("returns no issues for complete data", () => {
    const rows: ParsedRow[] = [
      { A: 1, B: 2 },
      { A: 3, B: 4 },
    ];
    expect(checkMissingValues(["A", "B"], rows)).toHaveLength(0);
  });

  it("marks fully-empty column as error severity", () => {
    const rows: ParsedRow[] = [
      { A: null },
      { A: null },
    ];
    const issues = checkMissingValues(["A"], rows);
    expect(issues[0].severity).toBe("error");
  });
});

describe("checkDuplicateColumns", () => {
  it("detects duplicate column names", () => {
    const issues = checkDuplicateColumns(["Nama", "Nilai", "Nama"]);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("duplicate_columns");
    expect(issues[0].affectedCount).toBe(2);
  });

  it("is case-insensitive", () => {
    const issues = checkDuplicateColumns(["nama", "Nama", "NAMA"]);
    expect(issues).toHaveLength(1);
    expect(issues[0].affectedCount).toBe(3);
  });

  it("returns no issues for unique columns", () => {
    expect(checkDuplicateColumns(["A", "B", "C"])).toHaveLength(0);
  });
});

describe("checkMissingHeaders", () => {
  it("detects empty header names", () => {
    const issues = checkMissingHeaders(["Nama", "", "Umur", ""]);
    expect(issues).toHaveLength(1);
    expect(issues[0].affectedCount).toBe(2);
  });

  it("returns no issues when all headers present", () => {
    expect(checkMissingHeaders(["A", "B", "C"])).toHaveLength(0);
  });
});

describe("checkDuplicateRows", () => {
  it("detects duplicate rows", () => {
    const headers = ["Produk", "Harga"];
    const rows: ParsedRow[] = [
      { Produk: "Apel", Harga: 15000 },
      { Produk: "Jeruk", Harga: 12000 },
      { Produk: "Apel", Harga: 15000 },
    ];
    const { duplicateCount, issue } = checkDuplicateRows(rows, headers);
    expect(duplicateCount).toBe(1);
    expect(issue).not.toBeNull();
    expect(issue!.type).toBe("duplicate_rows");
  });

  it("counts multiple duplicates correctly", () => {
    const headers = ["X"];
    const rows: ParsedRow[] = [
      { X: "a" }, { X: "a" }, { X: "a" }, // 2 duplicates
      { X: "b" }, { X: "b" }, // 1 duplicate
    ];
    const { duplicateCount } = checkDuplicateRows(rows, headers);
    expect(duplicateCount).toBe(3);
  });

  it("returns 0 for unique rows", () => {
    const rows: ParsedRow[] = [{ X: 1 }, { X: 2 }, { X: 3 }];
    const { duplicateCount, issue } = checkDuplicateRows(rows, ["X"]);
    expect(duplicateCount).toBe(0);
    expect(issue).toBeNull();
  });
});
