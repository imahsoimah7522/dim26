# TESTING — DataInsight Mini

> Strategi dan skenario pengujian  
> Versi: 1.0 | Terakhir diperbarui: 5 November 2026

---

## 1. Testing Strategy

### 1.1 Test Pyramid

```
          ┌──────────┐
          │   E2E    │    12 skenario
          │ (Playwright) │    User journeys kritis
          └─────┬────┘
                │
         ┌──────┴──────┐
         │ Integration │    20-30 test
         │  (Vitest)   │    API routes, DB, auth
         └──────┬──────┘
                │
      ┌─────────┴─────────┐
      │    Unit Tests      │    50+ test
      │    (Vitest)        │    Kalkulasi, parsing, mapping
      └───────────────────┘
```

### 1.2 Tools

| Tool        | Versi  | Kegunaan                                |
| ----------- | ------ | --------------------------------------- |
| Vitest      | latest | Unit + integration tests                |
| Playwright  | latest | E2E browser tests                       |
| MSW         | latest | API mocking untuk integration tests     |
| Testing Library | latest | Component testing (React)           |

### 1.3 Prinsip Testing (dari AGENTS.md)

- **Tulis unit test untuk semua perhitungan statistik** (Rule #10)
- **Jalankan lint, typecheck, dan test setelah implementasi** (Rule #11)
- **Tampilkan hasil pengujian yang benar-benar dijalankan** (Working Method)
- **Jangan mengklaim test pass tanpa menjalankan** (Working Method)

---

## 2. Unit Tests

### 2.1 Data Processing — `lib/processing/parser.ts`

| #  | Test Case                                    | Input                    | Expected Output              |
| -- | -------------------------------------------- | ------------------------ | ---------------------------- |
| U1 | Parse CSV file valid                         | CSV 5 kolom, 100 baris   | Array of objects, length 100 |
| U2 | Parse XLSX file valid                        | XLSX 3 kolom, 50 baris   | Array of objects, length 50  |
| U3 | Parse XLS file valid                         | XLS legacy format        | Array of objects             |
| U4 | Handle empty file                            | CSV kosong               | Empty array + warning        |
| U5 | Handle file tanpa header                     | CSV tanpa baris pertama  | Error: no header detected    |
| U6 | Handle special characters di header          | Header: "Harga (Rp)"    | Preserved as-is              |
| U7 | Handle mixed encoding (UTF-8/ANSI)           | File ANSI                | Correctly decoded            |
| U8 | Reject file > 10 MB                          | 15 MB file               | Error: file too large        |
| U9 | Handle file dengan baris kosong di tengah    | CSV dengan empty rows    | Skip empty rows              |
| U10| Parse angka dengan format Indonesia          | "1.500.000" (titik)      | 1500000 (number)             |

### 2.2 Column Detection — `lib/processing/column-detector.ts`

| #   | Test Case                                   | Input                         | Expected Output             |
| --- | ------------------------------------------- | ----------------------------- | --------------------------- |
| U11 | Detect numeric column                       | [100, 200, 300, 400]          | `detectedType: 'numeric'`   |
| U12 | Detect date column (ISO format)             | ["2024-01-01", "2024-02-01"]  | `detectedType: 'date'`      |
| U13 | Detect date column (DD/MM/YYYY)             | ["01/01/2024", "15/02/2024"]  | `detectedType: 'date'`      |
| U14 | Detect categorical column                   | ["A", "B", "A", "C", "B"]    | `detectedType: 'categorical'`|
| U15 | Detect text column (high cardinality)       | 100 unique strings            | `detectedType: 'text'`      |
| U16 | Handle mixed types in column                | [100, "abc", 200]             | Best-guess type              |
| U17 | Handle null/empty values                    | [100, null, "", 200]          | Ignore nulls, detect numeric |
| U18 | Suggest mapping: "Tanggal" → date           | Column name "Tanggal"         | `suggestedMapping: 'date'`   |
| U19 | Suggest mapping: "Total" → metric           | Column name "Total Penjualan" | `suggestedMapping: 'metric'` |
| U20 | Suggest mapping: "Kategori" → category      | Column name "Kategori"        | `suggestedMapping: 'category'`|
| U21 | < 20 unique values → categorical            | 15 unique values dari 1000    | `detectedType: 'categorical'`|
| U22 | Handle kolom yang 100% null                 | [null, null, null]            | `detectedType: 'unknown'`    |

### 2.3 Column Mapping — `lib/processing/column-mapper.ts`

| #   | Test Case                                   | Input                              | Expected Output             |
| --- | ------------------------------------------- | ---------------------------------- | --------------------------- |
| U23 | Apply valid mapping                         | Mapping: {"A": "date", "B": "metric"} | Mapping applied successfully |
| U24 | Reject mapping with no metric               | Mapping tanpa metric column        | Warning: no metric mapped   |
| U25 | Allow mapping with no date                  | Mapping tanpa date column          | Valid (no trend analysis)   |
| U26 | Validate mapping categories                 | Invalid: {"A": "invalid_type"}     | Zod validation error        |
| U27 | Handle "ignore" mapping                     | {"Notes": "ignore"}               | Column excluded from analysis|

### 2.4 Statistical Analysis — `lib/processing/analyzer.ts`

> [!IMPORTANT]
> Semua test di bagian ini WAJIB ada (AGENTS.md Development Rule #10).
> Gunakan dataset kecil dengan hasil yang bisa diverifikasi manual.

| #   | Test Case                                   | Input                              | Expected Output                  |
| --- | ------------------------------------------- | ---------------------------------- | -------------------------------- |
| U28 | Calculate total                             | [100, 200, 300]                    | 600                              |
| U29 | Calculate average                           | [100, 200, 300]                    | 200                              |
| U30 | Calculate median (odd count)                | [1, 3, 5, 7, 9]                   | 5                                |
| U31 | Calculate median (even count)               | [1, 3, 5, 7]                      | 4                                |
| U32 | Calculate min/max                           | [5, 1, 9, 3, 7]                   | min: 1, max: 9                   |
| U33 | Calculate standard deviation                | [2, 4, 4, 4, 5, 5, 7, 9]         | ≈ 2.0                            |
| U34 | Calculate growth rate                       | Period 1: 100, Period 2: 150      | 50%                              |
| U35 | Calculate growth rate (negative)            | Period 1: 200, Period 2: 150      | -25%                             |
| U36 | Calculate growth rate (from zero)           | Period 1: 0, Period 2: 100        | Handled (infinity → null)        |
| U37 | Ranking by metric                           | Categories with values             | Sorted descending                |
| U38 | Top N extraction                            | 10 items, N=3                      | Top 3 items                      |
| U39 | Bottom N extraction                         | 10 items, N=3                      | Bottom 3 items                   |
| U40 | Percentage distribution                     | [A:30, B:50, C:20]               | [A:30%, B:50%, C:20%]            |
| U41 | Outlier detection (IQR)                     | [1,2,3,4,5,100]                   | 100 flagged as outlier           |
| U42 | Handle single value                         | [42]                               | Total:42, avg:42, stddev:0       |
| U43 | Handle empty dataset                        | []                                 | All stats: null/0                |
| U44 | Handle large numbers (Rupiah)               | [1_500_000_000, 2_000_000_000]    | No precision loss                |
| U45 | Trend: month-over-month aggregation         | Daily data → monthly summary      | Correct monthly totals           |
| U46 | Trend: growth with date gaps                | Jan, Mar (no Feb)                  | Handle missing periods           |
| U47 | Correlation (two metrics)                   | Revenue vs Quantity                | Pearson coefficient              |
| U48 | Category frequency count                    | ["A","B","A","C","A"]             | {A:3, B:1, C:1}                 |

### 2.5 Zod Schemas — `lib/schemas/`

| #   | Test Case                                   | Schema          | Expected             |
| --- | ------------------------------------------- | --------------- | -------------------- |
| U49 | Valid upload metadata                        | `upload.ts`     | Pass                 |
| U50 | Invalid file type                            | `upload.ts`     | Zod error            |
| U51 | File size exceeds limit                      | `upload.ts`     | Zod error            |
| U52 | Valid column mapping                         | `mapping.ts`    | Pass                 |
| U53 | Invalid mapping category                     | `mapping.ts`    | Zod error            |
| U54 | Valid analysis result                        | `analysis.ts`   | Pass                 |
| U55 | Valid report schema                          | `report.ts`     | Pass                 |

### 2.6 Utility Functions — `lib/utils/`

| #   | Test Case                                   | Input                    | Expected Output         |
| --- | ------------------------------------------- | ------------------------ | ----------------------- |
| U56 | Format Rupiah                               | 1500000                  | "Rp1.500.000"           |
| U57 | Format Rupiah (negatif)                     | -500000                  | "-Rp500.000"            |
| U58 | Format percentage                           | 0.1567                   | "15,67%"                |
| U59 | Format date (Indonesia)                     | "2024-01-15"             | "15 Januari 2024"       |
| U60 | Format large number (compact)               | 1500000                  | "1,5 jt" atau "1,5M"   |

---

## 3. Integration Tests

### 3.1 API Routes

| #   | Test Case                                   | Route                    | Expected                     |
| --- | ------------------------------------------- | ------------------------ | ---------------------------- |
| I1  | POST /api/insight — valid request           | `/api/insight`           | 200 + insights array         |
| I2  | POST /api/insight — no auth                 | `/api/insight`           | 401 Unauthorized             |
| I3  | POST /api/insight — invalid body            | `/api/insight`           | 400 + Zod errors             |
| I4  | POST /api/insight — rate limited            | `/api/insight` x11       | 429 Too Many Requests        |
| I4a | POST /api/insight — no consent              | `/api/insight`           | 400 consentGranted required  |
| I5  | POST /api/report — valid request            | `/api/report`            | 200 + report metadata        |
| I6  | POST /api/report — no payment               | `/api/report`            | 403 Forbidden                |
| I7  | GET /api/report/[id] — owner access         | `/api/report/abc`        | 200 + signed URL             |
| I8  | GET /api/report/[id] — non-owner            | `/api/report/abc`        | 404 Not Found (RLS)          |
| I9  | GET /api/report/[id] — no auth              | `/api/report/abc`        | 401 Unauthorized             |
| I10 | POST /api/webhook/payment — valid signature | `/api/webhook/payment`   | 200 + payment updated        |
| I11 | POST /api/webhook/payment — invalid sig     | `/api/webhook/payment`   | 401 Invalid signature        |
| I12 | POST /api/webhook/payment — duplicate       | `/api/webhook/payment`   | 200 + already_processed      |
| I13 | POST /api/webhook/payment — amount mismatch | `/api/webhook/payment`  | 400 Amount mismatch          |

### 3.2 Database (RLS)

| #   | Test Case                                   | Table            | Expected                     |
| --- | ------------------------------------------- | ---------------- | ---------------------------- |
| I14 | User A can read own uploads                 | `uploads`        | Returns user A data only     |
| I15 | User A cannot read user B uploads           | `uploads`        | Empty result                 |
| I16 | User can read own reports                   | `reports`        | Returns own reports          |
| I17 | User cannot read other's reports            | `reports`        | Empty result                 |
| I18 | User can view own payments                  | `payments`       | Returns own payments         |
| I19 | User cannot INSERT payment (anon key)       | `payments`       | RLS policy violation         |
| I20 | Service role can INSERT payment             | `payments`       | Success                      |
| I21 | Soft-deleted uploads not visible            | `uploads`        | Filtered by RLS              |
| I22 | Report access only for granted users        | `report_access`  | Returns only own access      |

### 3.3 Auth Flow

| #   | Test Case                                   | Expected                              |
| --- | ------------------------------------------- | ------------------------------------- |
| I23 | Email signup + profile auto-created         | Profile exists after signup           |
| I24 | Google OAuth + profile auto-created         | Profile exists after OAuth            |
| I25 | Session persists across page navigation     | User stays logged in                  |
| I26 | Expired session redirects to login          | Redirect to /auth/login               |

### 3.4 Gemini API Integration

| #   | Test Case                                   | Expected                              |
| --- | ------------------------------------------- | ------------------------------------- |
| I27 | Valid summary → insights returned           | Array of 3-5 insights in Indonesian   |
| I28 | Empty summary → graceful error              | Fallback message to user              |
| I29 | Gemini API timeout → error handling         | User-friendly timeout message         |
| I30 | Gemini API error → retry logic              | Max 2 retries, then error             |

---

## 4. E2E Tests (Playwright)

### 4.1 Demo Journey

| #   | Test Case                                    | Steps                                    |
| --- | -------------------------------------------- | ---------------------------------------- |
| E1  | Complete demo flow                           | 1. Visit landing page                    |
|     |                                              | 2. Click "Coba Demo"                     |
|     |                                              | 3. Select demo dataset                   |
|     |                                              | 4. Verify column mapping displayed       |
|     |                                              | 5. Verify dashboard renders              |
|     |                                              | 6. Verify "Data Demo" label visible      |
|     |                                              | 7. Verify AI insights displayed          |
|     |                                              | 8. Verify CTA to paid flow               |
| E2  | Demo accessible without login                | 1. Visit /demo (no auth)                 |
|     |                                              | 2. Verify no login required              |
|     |                                              | 3. Full demo flow accessible             |

### 4.2 Upload & Mapping Journey

| #   | Test Case                                    | Steps                                    |
| --- | -------------------------------------------- | ---------------------------------------- |
| E3  | Upload CSV and complete mapping              | 1. Login                                 |
|     |                                              | 2. Navigate to upload                    |
|     |                                              | 3. Upload test CSV                       |
|     |                                              | 4. Verify preview table (10 rows)        |
|     |                                              | 5. Verify auto-detect suggestions        |
|     |                                              | 6. Adjust one mapping manually           |
|     |                                              | 7. Confirm mapping                       |
|     |                                              | 8. Verify analysis starts                |
| E4  | Upload XLSX with Indonesian number format    | 1. Upload XLSX with "1.500.000" format   |
|     |                                              | 2. Verify numbers parsed correctly       |
|     |                                              | 3. Mapping suggestions appropriate       |
| E5  | Reject invalid file                          | 1. Try uploading .pdf file               |
|     |                                              | 2. Verify error message displayed        |
|     |                                              | 3. Try uploading 15 MB file              |
|     |                                              | 4. Verify file size error                |

### 4.3 Payment & Report Journey

| #   | Test Case                                    | Steps                                    |
| --- | -------------------------------------------- | ---------------------------------------- |
| E6  | Single report purchase flow                  | 1. Complete upload + mapping             |
|     |                                              | 2. See preview (summary cards + 1 chart) |
|     |                                              | 3. Verify other charts are blurred/locked|
|     |                                              | 4. Click "Beli Laporan"                  |
|     |                                              | 5. Redirected to payment gateway         |
|     |                                              | 6. (Simulate payment success)            |
|     |                                              | 7. Full dashboard accessible             |
|     |                                              | 8. AI consent dialog appears             |
|     |                                              | 9. User approves → insights displayed    |
|     |                                              | 10. Download PDF works                   |
| E7  | Business Pack — multiple reports             | 1. Purchase business pack                |
|     |                                              | 2. Upload + analyze first file           |
|     |                                              | 3. Verify credits: 4 remaining           |
|     |                                              | 4. Upload + analyze second file          |
|     |                                              | 5. Verify credits: 3 remaining           |
| E8  | Access denied without payment                | 1. Upload + mapping complete             |
|     |                                              | 2. Verify preview shows (summary + 1ch) |
|     |                                              | 3. Verify full charts are locked/blurred |
|     |                                              | 4. Try accessing full report             |
|     |                                              | 5. Verify paywall displayed              |

### 4.4 Security E2E

| #   | Test Case                                    | Steps                                    |
| --- | -------------------------------------------- | ---------------------------------------- |
| E9  | Cannot access other user's report            | 1. Login as User A, create report        |
|     |                                              | 2. Login as User B                       |
|     |                                              | 3. Try accessing User A's report URL     |
|     |                                              | 4. Verify 404 / forbidden                |
| E10 | Unauthenticated user redirected              | 1. Visit /upload without login           |
|     |                                              | 2. Verify redirect to /auth/login        |
| E11 | AI consent required before insight           | 1. Login, upload, pay                    |
|     |                                              | 2. Click "Dapatkan Insight AI"           |
|     |                                              | 3. Verify consent dialog appears         |
|     |                                              | 4. Verify data summary shown in dialog   |
|     |                                              | 5. Click "Setuju & Kirim"               |
|     |                                              | 6. Verify insights load                  |
| E12 | AI consent rejected — no data sent           | 1. Login, upload, pay                    |
|     |                                              | 2. Click "Dapatkan Insight AI"           |
|     |                                              | 3. Click "Batal" on consent dialog       |
|     |                                              | 4. Verify no API call made               |
|     |                                              | 5. Dashboard still accessible (no AI)    |

---

## 5. Test Data Strategy

### 5.1 Fixture Files

```
__tests__/
├── fixtures/
│   ├── valid-sales.csv           # Data penjualan standar
│   ├── valid-expenses.xlsx       # Data pengeluaran
│   ├── valid-inventory.csv       # Data stok/inventaris
│   ├── mixed-types.csv           # Kolom dengan tipe campuran
│   ├── indonesian-numbers.csv    # Format angka Indonesia
│   ├── large-dataset.csv         # 10.000 baris
│   ├── empty-file.csv            # File kosong
│   ├── no-header.csv             # Tanpa baris header
│   ├── special-chars.csv         # Karakter khusus di header
│   └── malformed.csv             # Format rusak
```

### 5.2 Test Database

- Gunakan **Supabase local** (`supabase start`) untuk integration tests.
- Seed data menggunakan script terpisah.
- Reset database di setiap test suite (`beforeAll`).

### 5.3 API Mocking

```typescript
// MSW handler contoh
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Gemini API
  http.post('https://generativelanguage.googleapis.com/v1/*', () => {
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              insights: [
                "📈 Penjualan meningkat 15% di bulan terakhir...",
                "🏆 Produk A adalah penyumbang revenue terbesar...",
                "⚠️ Terdapat penurunan di kategori B..."
              ]
            })
          }]
        }
      }]
    });
  }),
];
```

---

## 6. CI/CD Testing Pipeline

```
Push / PR
    │
    ▼
┌─────────────────┐
│  1. Lint         │  ← eslint
│     (30s)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Typecheck    │  ← tsc --noEmit
│     (30s)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Unit Tests   │  ← vitest run
│     (1-2 min)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  4. Integration     │  ← vitest run --project integration
│     Tests (2-3 min) │     (Supabase local)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  5. E2E Tests       │  ← playwright test
│     (3-5 min)       │     (preview deployment)
└────────┬────────────┘
         │
         ▼
✅ All pass → Deploy
❌ Any fail → Block merge
```

---

## 7. Coverage Target

| Layer        | Target    | Keterangan                                   |
| ------------ | --------- | -------------------------------------------- |
| Unit         | ≥ 90%     | Khususnya statistical calculations (wajib)   |
| Integration  | ≥ 70%     | API routes dan database queries              |
| E2E          | Critical paths | Semua user journeys utama                |
| Overall      | ≥ 80%     | Gabungan semua layer                         |

---

*Dokumen ini adalah bagian dari technical planning DataInsight Mini.*
*Referensi: [AGENTS.md](../AGENTS.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
