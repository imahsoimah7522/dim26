# ROADMAP — DataInsight Mini

> Tahapan implementasi dari setup hingga launch  
> Versi: 1.0 | Terakhir diperbarui: 5 November 2026

> [!IMPORTANT]
> Selesaikan satu fase sepenuhnya (termasuk test) sebelum pindah
> ke fase berikutnya (AGENTS.md Working Method).

---

## Overview

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5 ──▶ Phase 6 ──▶ Phase 7
Project     Upload &    Analysis    Dashboard   AI          Payment &   Polish &
Setup       Mapping     Engine      & Viz       Insight     Report      Launch
```

---

## Phase 1: Project Setup & Infrastructure

**Tujuan:** Fondasi proyek siap, semua tools terkonfigurasi, database
ter-deploy, dan hello-world berjalan di Vercel.

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | Next.js project init                    | App Router, TypeScript strict       |
| 2  | Tailwind CSS + shadcn/ui setup          | Theme, komponen dasar               |
| 3  | ESLint + Prettier config                | Strict rules                        |
| 4  | Vitest + Playwright setup               | Config + sample test                |
| 5  | Supabase project + local dev            | `supabase init`, local container    |
| 6  | Database schema migration               | ⚠️ Perlu persetujuan               |
| 7  | Supabase Auth config                    | Email + Google OAuth                |
| 8  | Supabase Storage buckets                | `reports` (private), `avatars` (public) |
| 9  | Environment variables                   | `.env.local` + `.env.example`       |
| 10 | Vercel deployment                       | Dev preview + auto-deploy           |
| 11 | Git + CI pipeline                       | lint → typecheck → test             |
| 12 | Folder structure                        | Sesuai ARCHITECTURE.md              |

### Acceptance Criteria Phase 1
- [ ] `pnpm dev` berjalan tanpa error
- [ ] `pnpm lint` pass
- [ ] `pnpm typecheck` pass
- [ ] Supabase local running, tabel ter-create
- [ ] RLS aktif di semua tabel
- [ ] Auth flow (signup + login) berfungsi
- [ ] Deploy ke Vercel preview berhasil
- [ ] CI pipeline berjalan di setiap push

### Persetujuan Diperlukan
- 🗄️ Database schema (tabel + RLS policies)
- 🔒 Auth configuration

---

## Phase 2: File Upload & Column Mapping

**Tujuan:** User bisa upload file Excel/CSV, melihat preview, dan
memetakan kolom ke kategori analisis.

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | FileDropzone component                  | Drag & drop, file type validation   |
| 2  | SheetJS integration                     | Parse Excel/CSV di browser          |
| 3  | File preview table                      | 10 baris pertama                    |
| 4  | Column detector                         | Auto-detect tipe data               |
| 5  | Column mapper UI                        | Dropdown mapping per kolom          |
| 6  | Mapping validation (Zod)                | Schema validasi mapping             |
| 7  | Upload metadata save                    | Simpan metadata ke Supabase         |
| 8  | Unit tests: parser                      | U1–U10                              |
| 9  | Unit tests: column detector             | U11–U22                             |
| 10 | Unit tests: column mapper               | U23–U27                             |

### Acceptance Criteria Phase 2
- [ ] File `.xlsx`, `.xls`, `.csv` berhasil di-parse di browser
- [ ] File > 10 MB ditolak dengan pesan error
- [ ] Preview menampilkan 10 baris pertama
- [ ] Auto-detect tipe kolom bekerja (> 70% akurasi)
- [ ] User bisa mengubah mapping suggestion
- [ ] User bisa set kolom sebagai "ignore"
- [ ] Mapping disimpan ke database
- [ ] Semua unit tests pass (U1–U27)
- [ ] Tidak ada file yang di-upload ke server

---

## Phase 3: Data Analysis Engine

**Tujuan:** Dari column mapping yang sudah dikonfirmasi, sistem
menghitung statistik dan menghasilkan analysis result.

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | Summary statistics                      | Total, avg, median, min, max, stddev|
| 2  | Trend analysis                          | Period-over-period growth           |
| 3  | Category ranking                        | Top/bottom N                        |
| 4  | Distribution calculation                | Percentage per category             |
| 5  | Outlier detection                       | IQR method                          |
| 6  | Correlation analysis                    | Between metric columns              |
| 7  | Analysis result schema (Zod)            | Typed analysis output               |
| 8  | Unit tests: analyzer                    | U28–U48 (WAJIB)                     |
| 9  | Unit tests: schemas                     | U49–U55                             |
| 10 | Unit tests: utilities                   | U56–U60                             |

### Acceptance Criteria Phase 3
- [ ] Semua kalkulasi statistik akurat (diverifikasi unit test)
- [ ] Tren dihitung jika ada kolom date + metric
- [ ] Ranking dihitung jika ada kolom category + metric
- [ ] Outlier detection bekerja dengan IQR
- [ ] Format angka Indonesia benar (Rp, persentase)
- [ ] Semua unit tests pass (U28–U60)
- [ ] Test coverage ≥ 90% untuk `lib/processing/`

---

## Phase 4: Dashboard & Visualisasi

**Tujuan:** Hasil analisis ditampilkan dalam dashboard interaktif
dengan chart dan summary cards.

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | SummaryCards component                  | KPI utama (total, avg, growth)      |
| 2  | TrendChart component                   | Recharts LineChart                  |
| 3  | CategoryChart component                | Recharts BarChart / PieChart        |
| 4  | DataTable component                    | Sortable table (shadcn/ui)          |
| 5  | Dashboard layout                       | Responsive grid layout              |
| 6  | Loading states                         | Skeleton + spinner                   |
| 7  | Error boundaries                       | Graceful error handling              |
| 8  | PaywallOverlay component               | Blur/lock untuk chart yang terkunci  |
| 9  | Demo datasets                          | 3 dataset sintetis                  |
| 10 | Demo flow                              | /demo page + DemoLabel              |
| 11 | E2E tests: demo journey                | E1–E2                               |

### Acceptance Criteria Phase 4
- [ ] Dashboard menampilkan chart sesuai tipe data
- [ ] Summary cards menunjukkan KPI utama
- [ ] Preview (gratis): summary cards + 1 chart utama tampil
- [ ] Full charts blur/lock untuk user yang belum bayar
- [ ] Chart responsive di mobile dan desktop
- [ ] Demo flow berjalan tanpa login
- [ ] Label "Data Demo" tampil jelas
- [ ] 3 dataset demo tersedia (penjualan, pengeluaran, stok)
- [ ] E2E test E1–E2 pass

---

## Phase 5: AI Insight (Gemini)

**Tujuan:** Gemini menghasilkan insight bisnis dalam Bahasa Indonesia
berdasarkan summary statistik.

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | Gemini prompt builder                   | Template + context injection        |
| 2  | API route `/api/insight`                | Server-side Gemini call             |
| 3  | Zod validation (request + response)     | Input/output schemas                |
| 4  | InsightPanel component                  | Display insights in UI              |
| 5  | AiConsentDialog component               | Consent UI sebelum kirim ke Gemini  |
| 6  | Loading state untuk AI                  | Streaming/polling UX                |
| 7  | Error handling                          | Timeout, retry, fallback            |
| 8  | Rate limiting                           | 10 req/min per user                 |
| 9  | Integration tests: Gemini API           | I1–I4a, I27–I30                     |

### Acceptance Criteria Phase 5
- [ ] Gemini menghasilkan 3–5 insight dalam Bahasa Indonesia
- [ ] Input ke Gemini hanya summary statistik (bukan file mentah)
- [ ] AiConsentDialog tampil sebelum data dikirim ke Gemini
- [ ] API menolak request tanpa `consentGranted: true`
- [ ] `GEMINI_API_KEY` tidak terekspos di client
- [ ] Rate limiting berfungsi (10 req/min)
- [ ] Error handling: timeout → retry → fallback message
- [ ] Integration tests pass (I1–I4a, I27–I30)

---

## Phase 6: Payment & Report Generation

**Tujuan:** User bisa membeli laporan, payment diverifikasi server-side,
laporan disimpan di private storage.

> [!CAUTION]
> Phase ini memerlukan persetujuan untuk:
> - 💳 Pilihan payment gateway
> - 💳 Integrasi payment
> - 🔒 Webhook security configuration

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | Payment gateway integration             | ⚠️ Gateway TBD, perlu persetujuan  |
| 2  | Payment initiation API                  | Server-side payment creation        |
| 3  | Webhook handler                         | HMAC verification + status update   |
| 4  | Credit system                           | Single (1) + Business Pack (5)      |
| 5  | Report HTML generation                  | Server-side compose                 |
| 6  | Report PDF generation                   | HTML → PDF conversion               |
| 7  | Supabase Storage upload                 | Private bucket, signed URL          |
| 8  | Report access control                   | `report_access` table integration   |
| 9  | ReportViewer + Download UI              | View HTML + download PDF            |
| 10 | Paywall UI                              | "Beli Laporan" / "Beli Paket"      |
| 11 | My Reports page                         | Daftar laporan user                 |
| 12 | Integration tests: payment              | I5–I13                              |
| 13 | Integration tests: RLS                  | I14–I22                             |
| 14 | E2E tests: payment journey              | E6–E8                               |
| 15 | E2E tests: preview flow                 | Verify preview vs paywall            |

### Acceptance Criteria Phase 6
- [ ] Payment gateway terintegrasi
- [ ] Webhook signature verification berfungsi
- [ ] Payment status hanya diupdate via server/webhook
- [ ] Idempotency: webhook tidak diproses 2x
- [ ] Amount verification: match antara DB dan webhook
- [ ] Credit system: single (1) dan pack (5) benar
- [ ] Report tersimpan di private storage
- [ ] Signed URL expire dalam 1 jam
- [ ] User hanya bisa akses report miliknya (RLS)
- [ ] Integration tests pass (I5–I22)
- [ ] E2E tests pass (E6–E8)

---

## Phase 7: Polish, Security Hardening & Launch

**Tujuan:** Aplikasi siap production — secure, performant, dan polished.

> [!CAUTION]
> Phase ini memerlukan persetujuan untuk:
> - 🔒 Security configuration final
> - 🚀 Deployment production

### Deliverables

| #  | Item                                    | Detail                              |
| -- | --------------------------------------- | ----------------------------------- |
| 1  | Security headers                        | CSP, X-Frame-Options, dll           |
| 2  | Rate limiting (semua routes)            | Sesuai SECURITY.md                  |
| 3  | Env validation                          | Runtime check server env            |
| 4  | Error pages                             | 404, 500, custom error pages        |
| 5  | SEO                                     | Meta tags, OG tags, sitemap         |
| 6  | Landing page                            | Hero, features, pricing, CTA        |
| 7  | Mobile responsive audit                 | Test di berbagai device             |
| 8  | Performance optimization                | Code splitting, lazy loading        |
| 9  | Accessibility audit                     | Keyboard nav, screen reader         |
| 10 | E2E security tests                      | E9–E12                              |
| 11 | Security checklist                      | Semua item di SECURITY.md           |
| 12 | Production deployment                   | ⚠️ Perlu persetujuan               |
| 13 | Monitoring + error tracking             | Vercel Analytics / Sentry           |
| 14 | Documentation final                     | README, API docs, user guide        |

### Acceptance Criteria Phase 7
- [ ] Security checklist 100% complete
- [ ] Lighthouse score > 90 (Performance, Accessibility)
- [ ] Semua E2E tests pass (E1–E12)
- [ ] Test coverage ≥ 80% overall
- [ ] No critical/high vulnerabilities
- [ ] Production deploy berhasil
- [ ] Monitoring aktif

---

## Dependency Graph

```
Phase 1: Setup
    │
    ├──▶ Phase 2: Upload & Mapping
    │        │
    │        ├──▶ Phase 3: Analysis Engine
    │        │        │
    │        │        ├──▶ Phase 4: Dashboard & Viz
    │        │        │        │
    │        │        │        ├──▶ Phase 5: AI Insight
    │        │        │        │        │
    │        │        │        │        └──▶ Phase 6: Payment & Report
    │        │        │        │                 │
    │        │        │        │                 └──▶ Phase 7: Launch
    │        │        │        │
    │        │        │        └──▶ (Demo flow complete di Phase 4)
    │        │        │
    │        │        └──▶ (Can demo analysis di Phase 3)
    │        │
    │        └──▶ (Can test upload di Phase 2)
    │
    └──▶ (Infra usable dari Phase 1)
```

### Fase yang Bisa Di-demo Lebih Awal

| Setelah Phase | Yang bisa di-demo                         |
| ------------- | ----------------------------------------- |
| Phase 2       | Upload file + column mapping              |
| Phase 3       | Upload + mapping + analisis (angka)       |
| Phase 4       | Full demo flow (dengan dataset sintetis)  |
| Phase 5       | Demo + AI insight                         |
| Phase 6       | Produk lengkap (dengan payment)           |

---

## Estimasi Waktu

| Phase | Nama                         | Estimasi     | Kumulatif     |
| ----- | ---------------------------- | ------------ | ------------- |
| 1     | Project Setup                | 2–3 hari     | 2–3 hari      |
| 2     | Upload & Mapping             | 3–4 hari     | 5–7 hari      |
| 3     | Analysis Engine              | 3–4 hari     | 8–11 hari     |
| 4     | Dashboard & Viz              | 3–4 hari     | 11–15 hari    |
| 5     | AI Insight                   | 2–3 hari     | 13–18 hari    |
| 6     | Payment & Report             | 4–5 hari     | 17–23 hari    |
| 7     | Polish & Launch              | 3–4 hari     | 20–27 hari    |

**Total estimasi: 20–27 hari kerja** (1–1.5 bulan)

> Estimasi ini mengasumsikan satu developer full-time
> dengan AI-assisted development.

---

## Risk Register

| Risk                                      | Impact | Mitigasi                          |
| ----------------------------------------- | ------ | --------------------------------- |
| Payment gateway integrasi kompleks        | High   | Mulai riset di Phase 4            |
| Gemini API latency tinggi                 | Medium | Caching + loading UX yang baik    |
| SheetJS edge cases (format Excel lama)    | Medium | Test dengan banyak file sample    |
| Column auto-detect akurasi rendah         | Medium | Fallback ke manual mapping        |
| Supabase free tier limit                  | Low    | Monitor usage, plan upgrade       |
| Vercel cold start                         | Low    | Optimize serverless functions     |

---

*Dokumen ini adalah bagian dari technical planning DataInsight Mini.*
*Referensi: [AGENTS.md](../AGENTS.md) | [PRD.md](./PRD.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
