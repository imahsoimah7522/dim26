// ===========================================
// DataInsight Mini — File Parser Tests
// ===========================================

import { describe, it, expect } from "vitest";
import { parseXlsx, parseCsv } from "@/features/data-import/file-parser";
import {
  retailSalesData,
  fnbSalesData,
  inventoryData,
  createXlsxBuffer,
  createCsvBuffer,
} from "./fixtures/generators";

describe("parseXlsx", () => {
  it("parses a valid XLSX with retail sales data", () => {
    const rows = retailSalesData();
    const buffer = createXlsxBuffer(rows);
    const result = parseXlsx(buffer);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(10);
    expect(result.columnCount).toBe(6);
    expect(result.headers).toContain("Tanggal");
    expect(result.headers).toContain("Produk");
    expect(result.headers).toContain("Total");
  });

  it("parses XLSX with multiple sheets", () => {
    const buffer = createXlsxBuffer(retailSalesData(), "Penjualan", [
      { name: "Inventaris", rows: inventoryData() },
    ]);
    const result = parseXlsx(buffer);

    expect(result.success).toBe(true);
    expect(result.sheetNames).toEqual(["Penjualan", "Inventaris"]);
    expect(result.selectedSheet).toBe("Penjualan");
  });

  it("parses a specific sheet by name", () => {
    const buffer = createXlsxBuffer(retailSalesData(), "Penjualan", [
      { name: "Inventaris", rows: inventoryData() },
    ]);
    const result = parseXlsx(buffer, "Inventaris");

    expect(result.success).toBe(true);
    expect(result.selectedSheet).toBe("Inventaris");
    expect(result.columnCount).toBe(6);
    expect(result.headers).toContain("Kode");
  });

  it("handles invalid XLSX buffer gracefully", () => {
    const garbage = new ArrayBuffer(100);
    const view = new Uint8Array(garbage);
    for (let i = 0; i < 100; i++) view[i] = Math.floor(Math.random() * 256);
    const result = parseXlsx(garbage);

    // SheetJS may or may not parse random bytes — we just ensure no crash
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("returns error for empty worksheet", () => {
    const buffer = createXlsxBuffer([]);
    const result = parseXlsx(buffer);

    expect(result.success).toBe(false);
    expect(result.error).toContain("data");
  });
});

describe("parseCsv", () => {
  it("parses a valid CSV with F&B data", () => {
    const buffer = createCsvBuffer(fnbSalesData());
    const result = parseCsv(buffer);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(8);
    expect(result.columnCount).toBe(5);
    expect(result.headers).toContain("Menu");
    expect(result.headers).toContain("Qty");
  });

  it("handles CSV with quoted values", () => {
    const csv = 'Nama,Deskripsi,Harga\n"Kopi, Susu","Minuman ""spesial""",18000\nTeh,Minuman biasa,8000';
    const buffer = new TextEncoder().encode(csv).buffer as ArrayBuffer;
    const result = parseCsv(buffer);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2);
  });

  it("parses a header-only CSV as 0 data rows", () => {
    const csv = "Nama,Umur,Kota";
    const buffer = new TextEncoder().encode(csv).buffer as ArrayBuffer;
    const result = parseCsv(buffer);

    // SheetJS treats header-only as a valid parse with 0 data rows
    expect(result.rowCount).toBe(0);
  });

  it("handles completely empty CSV", () => {
    const buffer = new TextEncoder().encode("").buffer as ArrayBuffer;
    const result = parseCsv(buffer);

    expect(result.success).toBe(false);
  });
});
