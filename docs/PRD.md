# PRD — DataInsight Mini

> Product Requirements Document  
> Versi: 1.0 | Terakhir diperbarui: 5 November 2026

---

## 1. Tujuan Produk

Membantu pemilik UMKM dan usaha kecil di Indonesia mengubah file
spreadsheet (Excel / CSV) menjadi dashboard visual dan laporan bisnis
yang mudah dipahami — tanpa perlu keahlian data analyst.

### Problem Statement

| Masalah                                  | Dampak                                    |
| ---------------------------------------- | ----------------------------------------- |
| Pemilik UMKM punya data di Excel tapi    | Keputusan bisnis berdasarkan intuisi,     |
| tidak tahu cara menganalisis             | bukan data                                |
| Hiring data analyst mahal                | Tidak terjangkau untuk usaha kecil        |
| Tools analitik (Tableau, Power BI)       | Learning curve terlalu tinggi             |
| terlalu kompleks                         |                                           |
| Data di spreadsheet beragam formatnya    | Sulit membuat analisis yang konsisten     |

### Value Proposition

- **Upload Excel/CSV → langsung dapat laporan bisnis** dalam hitungan menit.
- **Tidak perlu tahu statistik** — insight disajikan dalam bahasa bisnis.
- **Harga terjangkau** — mulai Rp29.000 per laporan.
- **Aman** — data diproses di browser, tidak disimpan permanen di server.

---

## 2. Target Persona

### Persona Primer: Rina — Pemilik Toko Online

| Atribut       | Detail                                                |
| ------------- | ----------------------------------------------------- |
| Usia          | 28–45 tahun                                           |
| Bisnis        | Toko online / UMKM dengan 1–20 karyawan               |
| Data          | Punya rekap penjualan, pengeluaran, atau inventaris   |
|               | di Excel/CSV                                          |
| Pain point    | Tidak punya waktu/kemampuan analisis data             |
| Goal          | Ingin tahu produk terlaris, tren bulanan, dan         |
|               | rekomendasi bisnis yang actionable                    |
| Tech literacy | Bisa menggunakan smartphone dan laptop, familiar      |
|               | dengan WhatsApp dan marketplace                       |

### Persona Sekunder: Budi — Manajer Operasional

| Atribut       | Detail                                                |
| ------------- | ----------------------------------------------------- |
| Usia          | 30–50 tahun                                           |
| Bisnis        | Mengelola operasional di UKM                          |
| Data          | Data operasional: stok, pengiriman, keuangan          |
| Pain point    | Perlu laporan berkala untuk owner tapi proses manual   |
| Goal          | Laporan visual yang bisa langsung dipresentasikan      |
| Tech literacy | Familiar dengan Excel, tapi bukan power user          |

---

## 3. Fitur MVP

### 3.1 Free Demo

Pengguna dapat mencoba semua fitur menggunakan **dataset sintetis**
bawaan aplikasi, tanpa perlu upload file atau membuat akun.

| Aspek             | Detail                                             |
| ----------------- | -------------------------------------------------- |
| Dataset           | 3 dataset sintetis (penjualan, pengeluaran, stok)  |
| Label             | Diberi label jelas "🏷️ Data Demo"                  |
| Fitur tersedia    | Semua fitur analisis dan visualisasi                |
| Batasan           | Tidak bisa upload file sendiri                     |
| Tujuan            | Menunjukkan value sebelum pembelian                 |

### 3.2 Upload & Column Mapping

Pengguna upload file Excel/CSV, lalu memetakan kolom ke kategori
analisis yang dipahami sistem.

#### Upload
- Format: `.xlsx`, `.xls`, `.csv`
- Ukuran maksimal: **10 MB**
- Parsing: dilakukan **di browser** menggunakan SheetJS
- File **tidak** di-upload ke server secara default
- Preview: tampilkan 10 baris pertama setelah parsing

#### Column Mapping (Mekanisme Kunci)

Karena tidak semua dataset adalah data penjualan, sistem **TIDAK**
mengasumsikan struktur kolom tertentu. Sebaliknya, sistem menggunakan
**column mapping** yang fleksibel:

```
┌─────────────────────────────────────────────────────────┐
│                   COLUMN MAPPING FLOW                    │
│                                                          │
│  1. User upload file                                     │
│  2. SheetJS parse → extract header + 5 baris sampel     │
│  3. Sistem deteksi tipe data per kolom:                  │
│     - Numerik (angka, mata uang)                         │
│     - Tanggal (date/datetime)                            │
│     - Kategorik (teks, enum)                             │
│     - Teks bebas (deskripsi, catatan)                    │
│  4. Sistem SUGGEST mapping berdasarkan nama kolom        │
│     dan tipe data (auto-detect)                          │
│  5. User REVIEW dan koreksi mapping di UI                │
│  6. Mapping final disimpan dan digunakan untuk analisis  │
└─────────────────────────────────────────────────────────┘
```

**Kategori mapping yang tersedia:**

| Kategori          | Tipe data    | Contoh kolom user              |
| ----------------- | ------------ | ------------------------------ |
| `date`            | Tanggal      | Tanggal, Date, Periode         |
| `metric`          | Numerik      | Jumlah, Total, Harga, Revenue  |
| `category`        | Kategorik    | Produk, Kategori, Region       |
| `identifier`      | Teks/ID      | No. Invoice, SKU, ID Pelanggan |
| `description`     | Teks bebas   | Catatan, Keterangan            |
| `ignore`          | —            | Kolom yang tidak relevan       |

**Auto-detect heuristic:**
- Nama kolom mengandung "tanggal", "date", "bulan" → suggest `date`
- Kolom berisi angka > 80% → suggest `metric`
- Kolom berisi < 20 nilai unik → suggest `category`
- Kolom berisi string panjang → suggest `description`
- Fallback: `ignore` (user harus assign manual)

### 3.3 Data Analysis Engine

Setelah mapping selesai, sistem menjalankan analisis berdasarkan
kombinasi kolom yang dimapping.

**Analisis otomatis berdasarkan mapping:**

| Kombinasi mapping          | Analisis yang dihasilkan            |
| -------------------------- | ----------------------------------- |
| `date` + `metric`          | Tren waktu, pertumbuhan, seasonality|
| `category` + `metric`      | Ranking, distribusi, perbandingan   |
| `date` + `category` + `metric` | Tren per kategori, kontribusi   |
| `metric` + `metric`        | Korelasi, rasio                     |
| `category` saja            | Frekuensi, distribusi               |

**Kalkulasi statistik:**
- Total, rata-rata, median, min, max
- Pertumbuhan period-over-period (jika ada `date`)
- Standar deviasi dan outlier detection
- Top/bottom N per kategori
- Distribusi persentase

#### Preview vs Full Report

Pengguna yang belum membayar tetap bisa melihat **preview analisis**
setelah upload dan mapping selesai. Ini mendorong konversi ke paid.

| Konten                       | Preview (gratis) | Full (berbayar) |
| ---------------------------- | :--------------: | :-------------: |
| Summary cards (total, avg,   | ✅               | ✅              |
| min, max)                    |                  |                 |
| 1 chart utama                | ✅               | ✅              |
| Semua chart (tren, ranking,  | ❌ blur/lock     | ✅              |
| distribusi, korelasi)        |                  |                 |
| AI Insight (Gemini)          | ❌               | ✅              |
| Detail data table            | ❌               | ✅              |
| Download PDF                 | ❌               | ✅              |
| Outlier & deep analysis      | ❌               | ✅              |

### 3.4 Dashboard & Visualisasi

Dashboard interaktif yang menampilkan hasil analisis.

| Komponen              | Library   | Keterangan                       |
| --------------------- | --------- | -------------------------------- |
| Line chart            | Recharts  | Tren waktu                       |
| Bar chart             | Recharts  | Perbandingan kategori            |
| Pie / Donut chart     | Recharts  | Distribusi proporsi              |
| Summary cards         | shadcn/ui | KPI utama (total, rata-rata dll) |
| Data table            | shadcn/ui | Detail data dengan sorting       |

### 3.5 AI Insight (Gemini)

Gemini API menghasilkan insight dalam **Bahasa Indonesia** berdasarkan
hasil analisis statistik (bukan file mentah).

**User harus memberikan persetujuan eksplisit** sebelum data ringkasan
dikirim ke Gemini API. Sistem menampilkan dialog konfirmasi yang
menjelaskan data apa saja yang akan dikirim.

| Aspek           | Detail                                             |
| --------------- | -------------------------------------------------- |
| Input ke Gemini | Summary statistik + sampel data (bukan file asli)  |
| Consent         | ⚠️ User harus menyetujui pengiriman data ke AI     |
| Output          | 3–5 insight dalam bahasa bisnis sederhana           |
| Format          | Bullet points dengan penjelasan dan rekomendasi     |
| Bahasa          | Indonesia                                           |
| Batasan         | Tidak menerima file mentah (AGENTS.md Security #7)  |

### 3.6 Report Generation

Laporan PDF/HTML yang bisa diunduh atau dibagikan.

| Aspek           | Detail                                             |
| --------------- | -------------------------------------------------- |
| Format          | HTML (viewable) + PDF (downloadable)               |
| Konten          | Summary, visualisasi, insight AI, data table       |
| Storage         | Private bucket di Supabase Storage                 |
| Akses           | Signed URL dengan expiry (24 jam)                  |
| Branding        | Logo DataInsight Mini + tanggal generate            |

### 3.7 Autentikasi & Pembayaran

| Aspek           | Detail                                             |
| --------------- | -------------------------------------------------- |
| Auth            | Supabase Auth (email + Google OAuth)               |
| Login required  | Hanya untuk pembelian laporan                      |
| Demo            | Tidak perlu login                                  |
| Payment         | Per laporan (Rp29.000) atau paket (Rp79.000)       |
| Gateway         | TBD — akan ditentukan di fase implementasi          |
| Verifikasi      | Server-side via webhook (AGENTS.md Security #5)    |

---

## 4. User Journey

### Journey 1: Demo (Tanpa Login)

```
Landing Page
    │
    ▼
Pilih Dataset Demo ─── [Penjualan / Pengeluaran / Stok]
    │
    ▼
Lihat Column Mapping (pre-configured, read-only)
    │
    ▼
Lihat Dashboard + Visualisasi ─── Label "🏷️ Data Demo"
    │
    ▼
Lihat AI Insight (demo)
    │
    ▼
CTA: "Analisis data Anda sendiri → Rp29.000"
```

### Journey 2: Paid Report (Single)

```
Landing Page / Post-Demo
    │
    ▼
Login / Register (Supabase Auth)
    │
    ▼
Upload File (Excel/CSV) ─── parse di browser
    │
    ▼
Column Mapping ─── auto-detect + user review
    │
    ▼
Preview Analisis (gratis):
  ├── Summary cards (total, rata-rata, min, max)
  ├── 1 chart utama (tren atau ranking)
  └── Pesan: "Dapatkan insight lengkap + PDF"
    │
    ▼
Bayar Rp29.000 ─── Payment Gateway
    │
    ▼
[Webhook verifikasi pembayaran]
    │
    ▼
Full Dashboard (semua chart + tabel)
    │
    ▼
User klik "Dapatkan Insight AI"
    │
    ▼
AiConsentDialog ─── user setuju kirim ringkasan ke AI
    │
    ▼
AI Insight ditampilkan + Downloadable Report
    │
    ▼
Report tersimpan di akun (private storage)
```

### Journey 3: Business Pack

```
Login
    │
    ▼
Pilih Business Pack (Rp79.000)
    │
    ▼
Bayar ─── Payment Gateway
    │
    ▼
[Webhook verifikasi]
    │
    ▼
Upload hingga 5 file ─── masing-masing di-mapping
    │
    ▼
5 Laporan lengkap ─── Dashboard + Insight + PDF
    │
    ▼
Semua report tersimpan di akun
```

---

## 5. Acceptance Criteria (MVP)

### AC-1: Demo Flow
- [ ] User dapat memilih 1 dari 3 dataset demo tanpa login
- [ ] Dashboard menampilkan visualisasi yang benar
- [ ] Label "Data Demo" tampil jelas di semua halaman demo
- [ ] AI insight ditampilkan dalam Bahasa Indonesia

### AC-2: Upload & Parsing
- [ ] File `.xlsx`, `.xls`, `.csv` berhasil diparsing di browser
- [ ] File > 10 MB ditolak dengan pesan error yang jelas
- [ ] Preview menampilkan 10 baris pertama setelah upload
- [ ] Tidak ada file yang di-upload ke server saat parsing

### AC-3: Column Mapping
- [ ] Sistem mendeteksi tipe data per kolom secara otomatis
- [ ] Suggestion mapping ditampilkan berdasarkan heuristic
- [ ] User dapat mengubah mapping yang disarankan
- [ ] User dapat menandai kolom sebagai "ignore"
- [ ] Mapping dapat di-confirm sebelum analisis dimulai

### AC-4: Analisis & Visualisasi
- [ ] Kalkulasi statistik akurat (diverifikasi oleh unit test)
- [ ] Visualisasi sesuai dengan tipe data yang dimapping
- [ ] Dashboard responsive di desktop dan mobile
- [ ] Tidak ada data hardcoded di hasil analisis user

### AC-5: AI Insight
- [ ] Insight dihasilkan dari summary statistik, bukan file mentah
- [ ] User dimintai persetujuan sebelum data dikirim ke Gemini
- [ ] Dialog consent menampilkan ringkasan data yang akan dikirim
- [ ] Insight dalam Bahasa Indonesia dan relevan dengan data
- [ ] Minimal 3 insight per laporan
- [ ] Loading state ditampilkan saat menunggu response Gemini

### AC-6: Report & Storage
- [ ] Laporan dapat di-download sebagai PDF
- [ ] Laporan tersimpan di private storage Supabase
- [ ] Akses via signed URL dengan expiry
- [ ] User hanya bisa mengakses laporan miliknya (RLS)

### AC-7: Payment
- [ ] Pembayaran diverifikasi di server via webhook
- [ ] Status payment tidak bisa dimanipulasi dari frontend
- [ ] User mendapat akses report setelah webhook sukses
- [ ] Business Pack memberikan kuota 5 laporan

### AC-8: Security
- [ ] Tidak ada API key yang terekspos di client bundle
- [ ] RLS aktif pada semua tabel yang menyimpan data user
- [ ] Input divalidasi dengan Zod di server-side
- [ ] File diproses di browser, bukan di server

---

## 6. Batasan MVP (Out of Scope)

Fitur-fitur berikut **TIDAK** termasuk dalam MVP:

| Fitur                          | Alasan                              |
| ------------------------------ | ----------------------------------- |
| Multi-sheet analysis           | Kompleksitas mapping bertambah      |
| Real-time collaboration        | Bukan kebutuhan utama UMKM         |
| Custom visualization builder   | Terlalu advanced untuk target user  |
| API publik                     | Belum ada kebutuhan integrasi       |
| Mobile app (native)            | Web responsive sudah cukup          |
| Subscription model             | Business model adalah pay-per-report|
| Multi-language (EN, dll)       | Fokus pasar Indonesia              |
| Data source selain file        | Database, API, dsb — post-MVP      |
| Scheduling/auto-report         | Fitur lanjutan post-MVP             |
| White-label / multi-tenant     | Enterprise feature, bukan MVP       |

---

## 7. Metrik Keberhasilan

| Metrik                         | Target MVP                         |
| ------------------------------ | ----------------------------------- |
| Demo → Paid conversion         | > 5%                               |
| Upload success rate            | > 95%                              |
| Column mapping accuracy        | > 70% auto-detect benar            |
| Report generation time         | < 30 detik                         |
| User satisfaction (feedback)   | > 4.0 / 5.0                        |

---

*Dokumen ini adalah bagian dari technical planning DataInsight Mini.*
*Referensi: [AGENTS.md](../AGENTS.md)*
