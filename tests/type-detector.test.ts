// ===========================================
// DataInsight Mini — Type Detector Tests
// ===========================================

import { describe, it, expect } from "vitest";
import { detectColumnType } from "@/features/data-profiling/type-detector";

describe("detectColumnType", () => {
  it("detects numeric column", () => {
    expect(detectColumnType([10, 20, 30, 40, 50])).toBe("numeric");
  });

  it("detects numeric strings", () => {
    expect(detectColumnType(["100", "200", "300.5", "400"])).toBe("numeric");
  });

  it("detects date column (ISO format)", () => {
    expect(detectColumnType(["2024-01-01", "2024-02-15", "2024-03-20"])).toBe("date");
  });

  it("detects date column (DD/MM/YYYY)", () => {
    expect(detectColumnType(["01/01/2024", "15/02/2024", "20/03/2024"])).toBe("date");
  });

  it("detects Date objects", () => {
    expect(detectColumnType([new Date(2024, 0, 1), new Date(2024, 1, 15)])).toBe("date");
  });

  it("detects categorical column", () => {
    expect(
      detectColumnType(["Makanan", "Minuman", "Snack", "Makanan", "Minuman", "Makanan", "Snack", "Minuman"])
    ).toBe("categorical");
  });

  it("detects boolean column", () => {
    expect(detectColumnType(["Ya", "Tidak", "Ya", "Ya", "Tidak"])).toBe("boolean");
  });

  it("detects text column (many unique values)", () => {
    const names = Array.from({ length: 50 }, (_, i) => `Nama_${i}`);
    expect(detectColumnType(names)).toBe("text");
  });

  it("detects empty column", () => {
    expect(detectColumnType([null, null, "", undefined])).toBe("empty");
  });

  it("handles mixed types — majority numeric", () => {
    expect(detectColumnType([10, 20, "30", "40", "abc"])).toBe("numeric");
  });

  it("handles Rupiah-formatted numbers", () => {
    expect(detectColumnType(["Rp 15.000", "Rp 20.000", "Rp 30.000"])).toBe("numeric");
  });
});
