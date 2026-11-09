// ===========================================
// DataInsight Mini — File Validator Tests
// ===========================================

import { describe, it, expect } from "vitest";
import { validateFile, validateDimensions } from "@/features/data-import/file-validator";

function makeFile(name: string, size: number, type = "application/octet-stream"): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("validateFile", () => {
  it("accepts a valid .xlsx file", () => {
    const file = makeFile("sales.xlsx", 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.extension).toBe(".xlsx");
    expect(result.fileName).toBe("sales.xlsx");
  });

  it("accepts a valid .csv file", () => {
    const file = makeFile("data.csv", 512);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.extension).toBe(".csv");
  });

  it("rejects an empty file", () => {
    const file = makeFile("empty.xlsx", 0);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("kosong");
  });

  it("rejects a file exceeding 5 MB", () => {
    const file = makeFile("big.xlsx", 6 * 1024 * 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5 MB");
  });

  it("rejects an unsupported extension (.pdf)", () => {
    const file = makeFile("report.pdf", 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("tidak didukung");
  });

  it("rejects an unsupported extension (.xls)", () => {
    const file = makeFile("old.xls", 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("tidak didukung");
  });

  it("rejects a file without extension", () => {
    const file = makeFile("noext", 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("tidak didukung");
  });

  it("accepts a file just under the size limit", () => {
    const file = makeFile("ok.csv", 5 * 1024 * 1024);
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });
});

describe("validateDimensions", () => {
  it("accepts valid dimensions", () => {
    expect(validateDimensions(100, 10).valid).toBe(true);
  });

  it("rejects 0 rows", () => {
    const result = validateDimensions(0, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("minimal 1 baris");
  });

  it("rejects more than 10,000 rows", () => {
    const result = validateDimensions(10_001, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10.000");
  });

  it("rejects more than 50 columns", () => {
    const result = validateDimensions(100, 51);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("50");
  });

  it("rejects 0 columns", () => {
    const result = validateDimensions(10, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("kolom");
  });

  it("accepts exactly 10,000 rows and 50 columns", () => {
    expect(validateDimensions(10_000, 50).valid).toBe(true);
  });
});
