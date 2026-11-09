// ===========================================
// DataInsight Mini — Test Fixture Generator
// ===========================================
// Generates synthetic XLSX and CSV buffers for testing.

import * as XLSX from "xlsx";

export interface FixtureRow {
  [key: string]: string | number | null;
}

/**
 * Create an XLSX ArrayBuffer from rows.
 */
export function createXlsxBuffer(
  rows: FixtureRow[],
  sheetName = "Sheet1",
  extraSheets?: { name: string; rows: FixtureRow[] }[]
): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  if (extraSheets) {
    for (const s of extraSheets) {
      const es = XLSX.utils.json_to_sheet(s.rows);
      XLSX.utils.book_append_sheet(wb, es, s.name);
    }
  }

  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return out as ArrayBuffer;
}

/**
 * Create a CSV string from rows.
 */
export function createCsvString(rows: FixtureRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    const vals = headers.map((h) => {
      const v = row[h];
      if (v == null) return "";
      if (typeof v === "string" && (v.includes(",") || v.includes('"'))) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return String(v);
    });
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

/**
 * Create a CSV ArrayBuffer from rows.
 */
export function createCsvBuffer(rows: FixtureRow[]): ArrayBuffer {
  const csv = createCsvString(rows);
  return new TextEncoder().encode(csv).buffer as ArrayBuffer;
}

/**
 * Create a File object from an ArrayBuffer.
 */
export function createFileFromBuffer(
  buffer: ArrayBuffer,
  name: string,
  type = "application/octet-stream"
): File {
  return new File([buffer], name, { type });
}

// ─── Synthetic Datasets ──────────────────────────

/** Retail sales dataset (10 rows) */
export function retailSalesData(): FixtureRow[] {
  return [
    { Tanggal: "2024-01-05", Produk: "Sepatu Sneakers", Kategori: "Sepatu", Jumlah: 3, Harga: 350000, Total: 1050000 },
    { Tanggal: "2024-01-07", Produk: "Kaos Polos", Kategori: "Pakaian", Jumlah: 5, Harga: 89000, Total: 445000 },
    { Tanggal: "2024-01-10", Produk: "Tas Ransel", Kategori: "Aksesoris", Jumlah: 2, Harga: 275000, Total: 550000 },
    { Tanggal: "2024-01-12", Produk: "Sepatu Sneakers", Kategori: "Sepatu", Jumlah: 1, Harga: 350000, Total: 350000 },
    { Tanggal: "2024-01-15", Produk: "Celana Jeans", Kategori: "Pakaian", Jumlah: 4, Harga: 199000, Total: 796000 },
    { Tanggal: "2024-01-18", Produk: "Topi Baseball", Kategori: "Aksesoris", Jumlah: 6, Harga: 65000, Total: 390000 },
    { Tanggal: "2024-01-20", Produk: "Kaos Polos", Kategori: "Pakaian", Jumlah: 3, Harga: 89000, Total: 267000 },
    { Tanggal: "2024-01-22", Produk: "Sandal Casual", Kategori: "Sepatu", Jumlah: 2, Harga: 125000, Total: 250000 },
    { Tanggal: "2024-01-25", Produk: "Jaket Hoodie", Kategori: "Pakaian", Jumlah: 2, Harga: 299000, Total: 598000 },
    { Tanggal: "2024-01-28", Produk: "Dompet Kulit", Kategori: "Aksesoris", Jumlah: 1, Harga: 185000, Total: 185000 },
  ];
}

/** F&B sales dataset (8 rows) */
export function fnbSalesData(): FixtureRow[] {
  return [
    { Tanggal: "2024-02-01", Menu: "Kopi Susu", Kategori: "Minuman", Qty: 15, Harga: 18000 },
    { Tanggal: "2024-02-01", Menu: "Nasi Goreng", Kategori: "Makanan", Qty: 8, Harga: 25000 },
    { Tanggal: "2024-02-02", Menu: "Es Teh Manis", Kategori: "Minuman", Qty: 20, Harga: 8000 },
    { Tanggal: "2024-02-02", Menu: "Mie Ayam", Kategori: "Makanan", Qty: 12, Harga: 20000 },
    { Tanggal: "2024-02-03", Menu: "Kopi Susu", Kategori: "Minuman", Qty: 18, Harga: 18000 },
    { Tanggal: "2024-02-03", Menu: "Roti Bakar", Kategori: "Snack", Qty: 10, Harga: 15000 },
    { Tanggal: "2024-02-04", Menu: "Jus Alpukat", Kategori: "Minuman", Qty: 7, Harga: 22000 },
    { Tanggal: "2024-02-04", Menu: "Ayam Geprek", Kategori: "Makanan", Qty: 14, Harga: 28000 },
  ];
}

/** Inventory dataset (6 rows) */
export function inventoryData(): FixtureRow[] {
  return [
    { Kode: "SKU001", NamaBarang: "Beras Premium 5kg", Stok: 150, HargaBeli: 65000, HargaJual: 78000, Lokasi: "Gudang A" },
    { Kode: "SKU002", NamaBarang: "Minyak Goreng 2L", Stok: 80, HargaBeli: 32000, HargaJual: 38000, Lokasi: "Gudang A" },
    { Kode: "SKU003", NamaBarang: "Gula Pasir 1kg", Stok: 200, HargaBeli: 14000, HargaJual: 17000, Lokasi: "Gudang B" },
    { Kode: "SKU004", NamaBarang: "Tepung Terigu 1kg", Stok: 120, HargaBeli: 11000, HargaJual: 14500, Lokasi: "Gudang B" },
    { Kode: "SKU005", NamaBarang: "Kecap Manis 600ml", Stok: 50, HargaBeli: 18000, HargaJual: 22000, Lokasi: "Gudang A" },
    { Kode: "SKU006", NamaBarang: "Susu UHT 1L", Stok: 90, HargaBeli: 16000, HargaJual: 19500, Lokasi: "Gudang B" },
  ];
}

/** Numeric-heavy dataset (5 rows, 6 columns) */
export function numericData(): FixtureRow[] {
  return [
    { ID: 1, Nilai_A: 85.5, Nilai_B: 92.0, Nilai_C: 78.3, Rata2: 85.27, Lulus: "Ya" },
    { ID: 2, Nilai_A: 70.0, Nilai_B: 65.5, Nilai_C: 80.0, Rata2: 71.83, Lulus: "Ya" },
    { ID: 3, Nilai_A: 55.0, Nilai_B: 48.0, Nilai_C: 62.5, Rata2: 55.17, Lulus: "Tidak" },
    { ID: 4, Nilai_A: 90.0, Nilai_B: 88.5, Nilai_C: 95.0, Rata2: 91.17, Lulus: "Ya" },
    { ID: 5, Nilai_A: 42.0, Nilai_B: 50.0, Nilai_C: 38.0, Rata2: 43.33, Lulus: "Tidak" },
  ];
}

/** Dataset with missing values */
export function dataWithMissingValues(): FixtureRow[] {
  return [
    { Nama: "Andi", Umur: 25, Kota: "Jakarta" },
    { Nama: "Budi", Umur: null, Kota: "Bandung" },
    { Nama: "", Umur: 30, Kota: null },
    { Nama: "Dewi", Umur: 28, Kota: "Surabaya" },
    { Nama: null, Umur: null, Kota: "Medan" },
  ];
}

/** Dataset with duplicate rows */
export function dataWithDuplicates(): FixtureRow[] {
  return [
    { Produk: "Apel", Harga: 15000, Stok: 50 },
    { Produk: "Jeruk", Harga: 12000, Stok: 80 },
    { Produk: "Apel", Harga: 15000, Stok: 50 },  // duplicate of row 1
    { Produk: "Mangga", Harga: 20000, Stok: 30 },
    { Produk: "Jeruk", Harga: 12000, Stok: 80 },  // duplicate of row 2
  ];
}

/** Dataset with duplicate column names (raw headers) */
export function dataWithDuplicateHeaders(): { headers: string[]; rows: unknown[][] } {
  return {
    headers: ["Nama", "Nilai", "Nama", "Nilai"],
    rows: [
      ["Andi", 85, "Jakarta", 90],
      ["Budi", 70, "Bandung", 75],
    ],
  };
}

/** Generate a large dataset (for row limit testing) */
export function generateLargeDataset(rowCount: number): FixtureRow[] {
  const rows: FixtureRow[] = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push({
      ID: i + 1,
      Nama: `Item_${i + 1}`,
      Nilai: Math.round(Math.random() * 10000) / 100,
      Kategori: ["A", "B", "C"][i % 3],
    });
  }
  return rows;
}

/** Generate a dataset with many columns (for column limit testing) */
export function generateWideDataset(columnCount: number): FixtureRow[] {
  const row1: FixtureRow = {};
  const row2: FixtureRow = {};
  for (let i = 0; i < columnCount; i++) {
    const key = `Col_${i + 1}`;
    row1[key] = i + 1;
    row2[key] = (i + 1) * 10;
  }
  return [row1, row2];
}
