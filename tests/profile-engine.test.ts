// ===========================================
// DataInsight Mini — Profile Engine Tests
// ===========================================

import { describe, it, expect } from "vitest";
import { profileData } from "@/features/data-profiling/profile-engine";
import { parseXlsx, parseCsv } from "@/features/data-import/file-parser";
import {
  retailSalesData,
  dataWithMissingValues,
  dataWithDuplicates,
  generateLargeDataset,
  createXlsxBuffer,
  createCsvBuffer,
} from "./fixtures/generators";
import { validateDimensions } from "@/features/data-import/file-validator";

describe("profileData", () => {
  it("profiles retail sales data correctly", () => {
    const buffer = createXlsxBuffer(retailSalesData());
    const parsed = parseXlsx(buffer);
    expect(parsed.success).toBe(true);

    const profile = profileData(parsed);
    expect(profile.rowCount).toBe(10);
    expect(profile.columnCount).toBe(6);
    expect(profile.columns).toHaveLength(6);
    expect(profile.previewRows.length).toBeLessThanOrEqual(20);

    // Check column type detection
    const jumlahCol = profile.columns.find((c) => c.name === "Jumlah");
    expect(jumlahCol).toBeDefined();
    expect(jumlahCol!.detectedType).toBe("numeric");
    expect(jumlahCol!.numericStats).toBeDefined();

    const kategoriCol = profile.columns.find((c) => c.name === "Kategori");
    expect(kategoriCol).toBeDefined();
    expect(kategoriCol!.detectedType).toBe("categorical");
  });

  it("detects missing values in profile", () => {
    const buffer = createCsvBuffer(dataWithMissingValues());
    const parsed = parseCsv(buffer);
    expect(parsed.success).toBe(true);

    const profile = profileData(parsed);
    const missingIssues = profile.qualityIssues.filter(
      (i) => i.type === "missing_values"
    );
    expect(missingIssues.length).toBeGreaterThan(0);
  });

  it("detects duplicate rows in profile", () => {
    const buffer = createCsvBuffer(dataWithDuplicates());
    const parsed = parseCsv(buffer);
    expect(parsed.success).toBe(true);

    const profile = profileData(parsed);
    expect(profile.duplicateRowCount).toBe(2);
    const dupIssue = profile.qualityIssues.find(
      (i) => i.type === "duplicate_rows"
    );
    expect(dupIssue).toBeDefined();
  });

  it("computes numeric stats correctly", () => {
    const buffer = createCsvBuffer([
      { Nilai: 10 },
      { Nilai: 20 },
      { Nilai: 30 },
      { Nilai: 40 },
      { Nilai: 50 },
    ]);
    const parsed = parseCsv(buffer);
    const profile = profileData(parsed);

    const col = profile.columns.find((c) => c.name === "Nilai");
    expect(col).toBeDefined();
    expect(col!.numericStats).toBeDefined();
    expect(col!.numericStats!.min).toBe(10);
    expect(col!.numericStats!.max).toBe(50);
    expect(col!.numericStats!.mean).toBe(30);
    expect(col!.numericStats!.median).toBe(30);
  });

  it("limits preview to 20 rows", () => {
    const data = generateLargeDataset(100);
    const buffer = createCsvBuffer(data);
    const parsed = parseCsv(buffer);
    const profile = profileData(parsed);
    expect(profile.previewRows).toHaveLength(20);
  });
});

describe("dimension limits integration", () => {
  it("rejects dataset with more than 10,000 rows", () => {
    const result = validateDimensions(10_001, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10.000");
  });

  it("rejects dataset with more than 50 columns", () => {
    const result = validateDimensions(100, 51);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("50");
  });

  it("accepts dataset at exact limits", () => {
    expect(validateDimensions(10_000, 50).valid).toBe(true);
  });
});
