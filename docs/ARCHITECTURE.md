# ARCHITECTURE — DataInsight Mini

> Dokumen arsitektur teknis  
> Versi: 1.0 | Terakhir diperbarui: 5 November 2026

---

## 1. Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Next.js  │  │   SheetJS    │  │ Recharts │  │  shadcn/ui    │  │
│  │ App      │  │  (parsing)   │  │ (charts) │  │  (components) │  │
│  │ Router   │  │              │  │          │  │               │  │
│  └────┬─────┘  └──────┬───────┘  └──────────┘  └───────────────┘  │
│       │               │                                             │
│       │    ┌──────────┴───────────────┐                             │
│       │    │  Column Mapping Engine   │                             │
│       │    │  (auto-detect + UI)      │                             │
│       │    └──────────┬───────────────┘                             │
│       │               │                                             │
│       │    ┌──────────┴───────────────┐                             │
│       │    │  Analysis Engine         │                             │
│       │    │  (statistik di browser)  │                             │
│       │    └──────────────────────────┘                             │
│       │                                                             │
└───────┼─────────────────────────────────────────────────────────────┘
        │ HTTPS (API Routes)
        │
┌───────┼─────────────────────────────────────────────────────────────┐
│       ▼          SERVER (Vercel Serverless)                          │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │ API Routes     │  │ Server Actions │  │ Webhook Handler      │  │
│  │ /api/insight   │  │ (auth, report) │  │ /api/webhook/payment │  │
│  │ /api/report    │  │                │  │                      │  │
│  └───────┬────────┘  └───────┬────────┘  └──────────┬───────────┘  │
│          │                   │                      │               │
└──────────┼───────────────────┼──────────────────────┼───────────────┘
           │                   │                      │
    ┌──────┴──────┐    ┌──────┴──────┐    ┌──────────┴────────────┐
    │ Gemini API  │    │  Supabase   │    │  Payment Gateway      │
    │ (insight)   │    │  (DB/Auth/  │    │  (TBD)                │
    │             │    │   Storage)  │    │                       │
    └─────────────┘    └─────────────┘    └───────────────────────┘
```

### Prinsip Arsitektur

1. **Client-heavy processing** — File parsing dan analisis statistik
   dilakukan di browser. Server hanya untuk AI insight, auth, payment,
   dan storage.

2. **Data minimization** — Server hanya menerima summary statistik
   dan metadata, bukan file mentah pengguna.

3. **Layered separation** — UI, business logic, dan data processing
   dipisahkan sesuai AGENTS.md Development Rule #3.

4. **Privacy-first** — Data pengguna diproses di client, disimpan
   di private storage dengan RLS.

---

## 2. Frontend Architecture

### 2.1 Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── demo/
│   │   └── page.tsx              # Demo flow
│   ├── upload/
│   │   └── page.tsx              # Upload + mapping
│   ├── dashboard/
│   │   └── [reportId]/
│   │       └── page.tsx          # Dashboard per report
│   ├── reports/
│   │   └── page.tsx              # Daftar report user
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx     # OAuth callback
│   └── api/
│       ├── insight/route.ts      # Gemini proxy
│       ├── report/route.ts       # Report CRUD
│       └── webhook/
│           └── payment/route.ts  # Payment webhook
│
├── components/                   # UI Components
│   ├── ui/                       # shadcn/ui primitives
│   ├── upload/
│   │   ├── FileDropzone.tsx      # Drag & drop upload
│   │   ├── FilePreview.tsx       # Preview 10 baris
│   │   └── ColumnMapper.tsx      # Column mapping UI
│   ├── dashboard/
│   │   ├── SummaryCards.tsx       # KPI cards
│   │   ├── TrendChart.tsx        # Line chart
│   │   ├── CategoryChart.tsx     # Bar/Pie chart
│   │   └── DataTable.tsx         # Sortable table
│   ├── insight/
│   │   ├── InsightPanel.tsx      # AI insight display
│   │   └── AiConsentDialog.tsx   # Consent sebelum kirim ke Gemini
│   ├── report/
│   │   ├── ReportViewer.tsx      # HTML report view
│   │   └── ReportDownload.tsx    # PDF download button
│   └── shared/
│       ├── DemoLabel.tsx         # "Data Demo" badge
│       ├── PaywallOverlay.tsx    # Blur/lock overlay untuk preview
│       ├── LoadingState.tsx
│       └── ErrorBoundary.tsx
│
├── lib/                          # Business Logic
│   ├── processing/               # Data Processing Layer
│   │   ├── parser.ts             # SheetJS wrapper
│   │   ├── column-detector.ts    # Auto-detect tipe kolom
│   │   ├── column-mapper.ts      # Mapping logic
│   │   └── analyzer.ts           # Statistical calculations
│   ├── schemas/                  # Zod Schemas
│   │   ├── upload.ts             # Upload validation
│   │   ├── mapping.ts            # Column mapping schema
│   │   ├── analysis.ts           # Analysis result schema
│   │   └── report.ts             # Report schema
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── admin.ts              # Service role (server only)
│   ├── gemini/
│   │   └── insight.ts            # Gemini prompt builder
│   ├── demo/
│   │   └── datasets.ts           # Synthetic demo data
│   └── utils/
│       ├── format.ts             # Number/date formatting
│       └── constants.ts          # App constants
│
├── hooks/                        # React Hooks
│   ├── useFileParser.ts
│   ├── useColumnMapping.ts
│   ├── useAnalysis.ts
│   └── useReport.ts
│
└── types/                        # TypeScript Types
    ├── upload.ts
    ├── mapping.ts
    ├── analysis.ts
    └── report.ts
```

### 2.2 Page Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Landing     │───▶│  Demo        │───▶│  Dashboard   │
│  page.tsx    │    │  demo/       │    │  (demo data) │
└──────┬──────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Auth        │───▶│  Upload +    │───▶│  Preview     │
│  login/      │    │  Mapping     │    │  (gratis:    │
└─────────────┘    │  upload/     │    │  summary +   │
                   └──────────────┘    │  1 chart)    │
                                       └──────┬───────┘
                                              │
                                       ┌──────┴───────┐
                                       │  Paywall     │
                                       │  "Beli       │
                                       │  Laporan"    │
                                       └──────┬───────┘
                                              │
                   ┌──────────────┐    ┌──────┴───────┐
                   │  Dashboard   │◀───│  Payment     │
                   │  (full +     │    │  (gateway)   │
                   │  AI consent) │    └──────────────┘
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Report      │
                   │  Download    │
                   └──────────────┘
```

### 2.3 State Management

Tidak menggunakan state management library (Redux, Zustand, dll) di MVP.
Cukup dengan:

| Kebutuhan          | Solusi                              |
| ------------------ | ----------------------------------- |
| Server state       | React Server Components + fetch     |
| Form state         | React Hook Form + Zod               |
| Upload state       | `useState` + custom hooks           |
| Analysis state     | `useState` + `useReducer`           |
| Auth state         | Supabase Auth session (cookie)      |

---

## 3. Backend Architecture

### 3.1 API Routes

Semua API routes berada di `src/app/api/` dan berjalan sebagai
Vercel Serverless Functions.

| Route                        | Method | Auth    | Fungsi                      |
| ---------------------------- | ------ | ------- | --------------------------- |
| `/api/insight`               | POST   | ✅ User | Generate AI insight         |
| `/api/report`                | POST   | ✅ User | Simpan report ke storage    |
| `/api/report/[id]`           | GET    | ✅ User | Ambil report (signed URL)   |
| `/api/report/[id]/pdf`       | GET    | ✅ User | Generate + download PDF     |
| `/api/webhook/payment`       | POST   | 🔑 HMAC | Handle payment callback     |
| `/api/auth/callback`         | GET    | —       | OAuth callback handler      |

### 3.2 Server Security

```
Client Request
     │
     ▼
┌─────────────────┐
│  Middleware      │  ← Rate limiting, CORS
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Zod Validation │  ← Input sanitization
│  (per route)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth Check     │  ← Supabase session verification
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Business Logic │  ← Processing + response
└─────────────────┘
```

### 3.3 Environment Variables

| Variable                    | Side     | Keterangan                    |
| --------------------------- | -------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`  | Client   | Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anon key          |
| `SUPABASE_SERVICE_ROLE_KEY` | Server   | ⚠️ JANGAN ekspos ke client   |
| `GEMINI_API_KEY`            | Server   | ⚠️ JANGAN ekspos ke client   |
| `PAYMENT_SECRET_KEY`        | Server   | ⚠️ JANGAN ekspos ke client   |
| `PAYMENT_WEBHOOK_SECRET`    | Server   | ⚠️ JANGAN ekspos ke client   |

---

## 4. Data Processing Pipeline

### 4.1 Pipeline Overview

Semua processing terjadi **di browser** kecuali AI insight.

```
FILE (Excel/CSV)
     │
     ▼ [SheetJS — browser]
PARSED DATA (array of objects)
     │
     ▼ [Column Detector — browser]
COLUMN METADATA (tipe, statistik dasar per kolom)
     │
     ▼ [Column Mapper — browser + user input]
MAPPED SCHEMA (kategori per kolom: date, metric, category, dll)
     │
     ▼ [Analyzer — browser]
ANALYSIS RESULT (statistik, tren, ranking, distribusi)
     │
     ├──▶ [Recharts — browser] → PREVIEW DASHBOARD (summary + 1 chart)
     │
     ├──▶ [Payment verified?] → FULL DASHBOARD (semua chart + tabel)
     │
     └──▶ [AiConsentDialog — user setuju?]
              │ YES
              ▼
          [API /insight — server] → GEMINI → AI INSIGHT
                                        │
                                        ▼
                                   FULL REPORT
```

### 4.2 Column Detection Algorithm

```typescript
// Pseudocode — lib/processing/column-detector.ts

interface ColumnMeta {
  name: string;
  detectedType: 'numeric' | 'date' | 'categorical' | 'text' | 'unknown';
  uniqueCount: number;
  nullCount: number;
  sampleValues: unknown[];
  suggestedMapping: MappingCategory;
}

function detectColumnType(values: unknown[]): ColumnMeta {
  // 1. Hitung null/empty ratio
  // 2. Cek apakah > 80% bisa di-parse sebagai number → numeric
  // 3. Cek apakah > 80% bisa di-parse sebagai date → date
  // 4. Hitung unique values
  //    - < 20 unique dari total rows → categorical
  //    - Lainnya → text
  // 5. Suggest mapping berdasarkan nama kolom + detected type
}
```

### 4.3 Analysis Engine

```typescript
// Pseudocode — lib/processing/analyzer.ts

interface AnalysisResult {
  summary: SummaryStats;
  trends?: TrendData[];         // jika ada date + metric
  rankings?: RankingData[];     // jika ada category + metric
  distributions?: DistData[];   // jika ada category
  correlations?: CorrData[];    // jika ada metric + metric
  outliers?: OutlierData[];     // berdasarkan IQR
}

function analyze(
  data: Record<string, unknown>[],
  mapping: ColumnMapping
): AnalysisResult {
  // 1. Hitung summary stats per metric column
  // 2. Jika ada date mapping → hitung tren
  // 3. Jika ada category mapping → hitung ranking
  // 4. Detect outliers menggunakan IQR method
  // 5. Return structured result
}
```

---

## 5. AI Integration (Gemini)

### 5.1 Request Flow

Data hanya dikirim ke Gemini **setelah user memberikan persetujuan
eksplisit** melalui `AiConsentDialog`. Dialog menampilkan ringkasan
data yang akan dikirim agar user bisa meninjau sebelum menyetujui.

```
Browser                        Server                     Gemini
  │                              │                           │
  │  User klik "Dapatkan        │                           │
  │  Insight AI"                │                           │
  │         │                    │                           │
  │         ▼                    │                           │
  │  AiConsentDialog tampil:    │                           │
  │  "Data berikut akan         │                           │
  │   dikirim ke AI:            │                           │
  │   - Ringkasan statistik     │                           │
  │   - 5 baris sampel          │                           │
  │   - Mapping kolom"          │                           │
  │         │                    │                           │
  │  User klik "Setuju &        │                           │
  │  Kirim"                     │                           │
  │         │                    │                           │
  │  POST /api/insight           │                           │
  │  { analysisResult,           │                           │
  │    mappingInfo,              │                           │
  │    sampleData (5 rows),      │                           │
  │    consentGranted: true }    │                           │
  │─────────────────────────────▶│                           │
  │                              │  Validate with Zod       │
  │                              │  Verify consentGranted   │
  │                              │  Build prompt            │
  │                              │  POST Gemini API         │
  │                              │──────────────────────────▶│
  │                              │                           │
  │                              │  { insights: [...] }      │
  │                              │◀──────────────────────────│
  │                              │  Validate response       │
  │  { insights: [...] }        │  with Zod                │
  │◀─────────────────────────────│                           │
  │                              │                           │
```

### 5.2 Data yang Dikirim ke Gemini

Sesuai AGENTS.md Security #7, **TIDAK** mengirim file mentah.
Yang dikirim:

| Data              | Contoh                                    |
| ----------------- | ----------------------------------------- |
| Column mapping    | `{ "Produk": "category", "Total": "metric" }` |
| Summary stats     | `{ total: 15000000, avg: 250000, ... }`   |
| Top/bottom items  | Top 5 produk, bottom 3 region             |
| Trend summary     | Pertumbuhan bulan-ke-bulan                |
| Sample rows       | 5 baris representatif (bukan semua data)  |
| Context           | "Data penjualan toko online"              |

### 5.3 Prompt Template

```
Kamu adalah analis bisnis untuk UMKM Indonesia.
Berdasarkan data berikut, berikan 3-5 insight bisnis
yang actionable dalam Bahasa Indonesia.

[summary statistik]
[trend data]
[ranking data]

Format output:
1. [Emoji] **Judul Insight** — Penjelasan singkat + rekomendasi.

Gunakan bahasa sederhana yang dipahami pemilik usaha kecil.
Jangan gunakan istilah teknis statistik.
```

---

## 6. Report Generation

### 6.1 Flow

```
Dashboard (client)
     │
     ▼  User klik "Generate Report"
Collect: summary + charts (as SVG/PNG) + insights
     │
     ▼  POST /api/report
Server compose HTML report
     │
     ├──▶ Save HTML ke Supabase Storage (private bucket)
     │
     ├──▶ Generate PDF (menggunakan library server-side)
     │
     └──▶ Save metadata ke database (reports table)
     │
     ▼
Return signed URL (expiry 24 jam)
```

### 6.2 Report Structure

```html
<!-- Report HTML Template -->
<div class="report">
  <header>
    <h1>Laporan Analisis — {judul}</h1>
    <p>Dibuat: {tanggal} | DataInsight Mini</p>
  </header>

  <section class="summary">
    <!-- KPI Cards -->
  </section>

  <section class="visualizations">
    <!-- Chart images (rendered from Recharts) -->
  </section>

  <section class="insights">
    <!-- AI insights dari Gemini -->
  </section>

  <section class="data-detail">
    <!-- Top/bottom tables -->
  </section>

  <footer>
    <p>DataInsight Mini — datainsight.id</p>
  </footer>
</div>
```

---

## 7. Deployment Architecture

```
                    ┌──────────────────┐
                    │     Vercel       │
                    │                  │
                    │  ┌────────────┐  │
    CDN ◀───────────│  │  Static    │  │
                    │  │  Assets    │  │
                    │  └────────────┘  │
                    │                  │
                    │  ┌────────────┐  │
    API Requests ──▶│  │  Serverless│  │
                    │  │  Functions │  │
                    │  └─────┬──────┘  │
                    │        │         │
                    └────────┼─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Supabase │  │ Supabase │  │ Supabase │
        │ Database │  │ Auth     │  │ Storage  │
        │ (Postgres│  │          │  │ (private │
        │  + RLS)  │  │          │  │  bucket) │
        └──────────┘  └──────────┘  └──────────┘
```

### Environments

| Environment | URL                    | Database         | Keterangan      |
| ----------- | ---------------------- | ---------------- | --------------- |
| Development | `localhost:3000`       | Supabase local   | Dev + testing   |
| Preview     | `*.vercel.app`         | Supabase staging | PR previews     |
| Production  | `datainsight.id` (TBD) | Supabase prod    | Live            |

---

## 8. Keputusan Arsitektur

| # | Keputusan                          | Alasan                                     |
|---|------------------------------------|--------------------------------------------|
| 1 | File processing di browser         | Privasi data, kurangi beban server          |
| 2 | Tidak upload file ke server        | Data minimization, compliance              |
| 3 | Column mapping manual + auto       | Dataset beragam, bukan hanya penjualan     |
| 4 | Gemini hanya terima summary        | Security, efisiensi token, privasi         |
| 5 | No global state library            | Kompleksitas rendah di MVP                 |
| 6 | PDF generation di server           | Konsistensi output, akses ke fonts         |
| 7 | Signed URL untuk report            | Private access, time-limited sharing       |
| 8 | Pay-per-report, bukan subscription | Business model sesuai target UMKM          |

---

*Dokumen ini adalah bagian dari technical planning DataInsight Mini.*
*Referensi: [AGENTS.md](../AGENTS.md) | [PRD.md](./PRD.md)*
