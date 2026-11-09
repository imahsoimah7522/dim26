// ===========================================
// DataInsight Mini — Demo Synthetic Data
// ===========================================
// Data sintetis untuk mode demo.
// HANYA digunakan untuk demonstrasi, bukan data pelanggan.

export interface DemoSalesRecord {
  bulan: string;
  penjualan: number;
  target: number;
}

export interface DemoProductRecord {
  produk: string;
  jumlah: number;
  pendapatan: number;
}

export interface DemoCategoryRecord {
  kategori: string;
  pendapatan: number;
}

export interface DemoKPI {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

/** Data penjualan bulanan (Januari - Desember 2024) */
export const demoSalesData: DemoSalesRecord[] = [
  { bulan: "Jan", penjualan: 12_500_000, target: 15_000_000 },
  { bulan: "Feb", penjualan: 14_200_000, target: 15_000_000 },
  { bulan: "Mar", penjualan: 16_800_000, target: 15_000_000 },
  { bulan: "Apr", penjualan: 13_900_000, target: 16_000_000 },
  { bulan: "Mei", penjualan: 18_500_000, target: 16_000_000 },
  { bulan: "Jun", penjualan: 21_300_000, target: 18_000_000 },
  { bulan: "Jul", penjualan: 19_700_000, target: 18_000_000 },
  { bulan: "Agu", penjualan: 22_100_000, target: 20_000_000 },
  { bulan: "Sep", penjualan: 24_800_000, target: 20_000_000 },
  { bulan: "Okt", penjualan: 23_200_000, target: 22_000_000 },
  { bulan: "Nov", penjualan: 26_500_000, target: 22_000_000 },
  { bulan: "Des", penjualan: 31_200_000, target: 25_000_000 },
];

/** Data produk terlaris */
export const demoProductData: DemoProductRecord[] = [
  { produk: "Kopi Susu Gula Aren", jumlah: 1_240, pendapatan: 24_800_000 },
  { produk: "Es Teh Manis", jumlah: 980, pendapatan: 9_800_000 },
  { produk: "Nasi Goreng Spesial", jumlah: 750, pendapatan: 18_750_000 },
  { produk: "Mie Ayam Bakso", jumlah: 620, pendapatan: 12_400_000 },
  { produk: "Roti Bakar Coklat", jumlah: 540, pendapatan: 8_100_000 },
  { produk: "Jus Alpukat", jumlah: 420, pendapatan: 8_400_000 },
  { produk: "Ayam Geprek", jumlah: 380, pendapatan: 11_400_000 },
  { produk: "Soto Ayam", jumlah: 310, pendapatan: 7_750_000 },
];

/** Data kategori produk */
export const demoCategoryData: DemoCategoryRecord[] = [
  { kategori: "Minuman", pendapatan: 43_000_000 },
  { kategori: "Makanan Berat", pendapatan: 50_300_000 },
  { kategori: "Snack & Roti", pendapatan: 8_100_000 },
  { kategori: "Dessert", pendapatan: 5_200_000 },
];

/** KPI ringkasan bisnis */
export const demoKPIs: DemoKPI[] = [
  {
    label: "Total Penjualan",
    value: "Rp244,7 jt",
    change: 23.5,
    changeLabel: "vs tahun lalu",
  },
  {
    label: "Jumlah Transaksi",
    value: "5.240",
    change: 18.2,
    changeLabel: "vs tahun lalu",
  },
  {
    label: "Rata-rata per Transaksi",
    value: "Rp46.700",
    change: 4.5,
    changeLabel: "vs tahun lalu",
  },
  {
    label: "Produk Terlaris",
    value: "Kopi Susu Gula Aren",
    change: 32.1,
    changeLabel: "pertumbuhan",
  },
];

/** Insight bisnis dari analisis data demo */
export const demoInsights: string[] = [
  "📈 Penjualan menunjukkan tren naik yang konsisten sepanjang tahun, dengan pertumbuhan tertinggi di Q4 (Oktober–Desember). Total penjualan melampaui target di 9 dari 12 bulan.",
  "☕ Kopi Susu Gula Aren adalah produk paling laris dengan 1.240 unit terjual dan kontribusi pendapatan terbesar. Pertimbangkan untuk membuat variasi produk ini (iced, hot, less sugar).",
  "🍽️ Kategori Makanan Berat menyumbang 47% dari total pendapatan, diikuti oleh Minuman (40%). Kedua kategori ini harus tetap menjadi fokus utama.",
  "💡 Rata-rata transaksi Rp46.700 menunjukkan potensi untuk bundling produk. Coba tawarkan paket combo makanan + minuman untuk meningkatkan nilai transaksi.",
  "📊 Bulan Juni dan September menunjukkan lonjakan penjualan yang signifikan. Analisis lebih lanjut disarankan untuk memahami faktor pendorongnya (promo, musim, atau tren pasar).",
];
