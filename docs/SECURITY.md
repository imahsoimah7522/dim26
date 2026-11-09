# SECURITY — DataInsight Mini

> Threat model, kebijakan keamanan, dan security controls  
> Versi: 1.0 | Terakhir diperbarui: 5 November 2026

> [!CAUTION]
> Perubahan pada konfigurasi keamanan memerlukan persetujuan eksplisit
> dari pemilik proyek (AGENTS.md Working Method).

---

## 1. Threat Model

### 1.1 Aset yang Dilindungi

| Aset                      | Klasifikasi | Keterangan                          |
| ------------------------- | ----------- | ----------------------------------- |
| Data spreadsheet user     | Confidential| Data bisnis UMKM pengguna           |
| Hasil analisis & laporan  | Confidential| Konten berbayar                     |
| Kredensial pengguna       | Secret      | Email, password, OAuth token        |
| API keys                  | Secret      | Supabase service key, Gemini key    |
| Payment credentials       | Secret      | Gateway API key, webhook secret     |
| Informasi pembayaran user | Confidential| Riwayat transaksi                   |

### 1.2 Threat Actors

| Actor              | Motivasi                    | Kemampuan                   |
| ------------------ | --------------------------- | --------------------------- |
| Script kiddie      | Akses laporan gratis        | Manipulasi request          |
| Competitor         | Scraping data/pricing       | Automated scanning          |
| Malicious user     | Bypass payment              | Browser DevTools, Burp Suite|
| Insider (developer)| Akses data user             | Akses kode & env vars       |

### 1.3 Threat Matrix

| #  | Threat                                 | Aset Target      | Likelihood | Impact | Mitigasi                    |
| -- | -------------------------------------- | ----------------- | ---------- | ------ | --------------------------- |
| T1 | API key leak di client bundle          | API keys          | Medium     | High   | Server-side only env vars   |
| T2 | Bypass payment via frontend            | Laporan berbayar  | High       | High   | Server-side verification    |
| T3 | Akses laporan user lain                | Data user         | Medium     | High   | RLS + session check         |
| T4 | File upload malicious                  | Server            | Medium     | Medium | Client-side parsing only    |
| T5 | XSS via data di spreadsheet            | User session      | Medium     | Medium | Sanitize + CSP              |
| T6 | IDOR pada report endpoint              | Laporan berbayar  | Medium     | High   | RLS + ownership check       |
| T7 | Brute force login                      | Akun pengguna     | Low        | Medium | Rate limiting + Supabase    |
| T8 | Webhook forgery                        | Payment status    | Medium     | High   | HMAC signature verify       |
| T9 | SSRF via Gemini prompt injection       | Server            | Low        | Medium | Input sanitization          |
| T10| Data leak via AI model                 | Data user         | Low        | High   | Send summary only, not raw  |
| T11| User unaware data sent to AI           | Data user         | Medium     | Medium | Explicit consent dialog     |

---

## 2. Data Privacy

### 2.1 Prinsip Privacy-by-Design

```
┌──────────────────────────────────────────────────────────────┐
│                    DATA FLOW & PRIVACY                        │
│                                                              │
│  ┌──────────┐                                                │
│  │  File    │    ❌ File TIDAK di-upload ke server           │
│  │  Upload  │──────────────────────────────────────┐        │
│  └──────────┘                                      │        │
│                                                    ▼        │
│  ┌──────────┐    Diproses di BROWSER              ┌────┐    │
│  │  SheetJS │◀────────────────────────────────────│File│    │
│  │  Parse   │                                     └────┘    │
│  └────┬─────┘                                               │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────┐                                        │
│  │  Column Mapping   │    Di browser, oleh user              │
│  │  + Analysis       │                                       │
│  └────────┬──────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐    Hanya SUMMARY yang ke server        │
│  │  Summary Stats   │──────────▶ Server ──▶ Gemini          │
│  │  (bukan raw)     │    ⚠️ Hanya setelah user consent      │
│  └──────────────────┘                                        │
│                                                              │
│  Yang disimpan di server:                                    │
│  ✅ Metadata file (nama, ukuran, tipe)                       │
│  ✅ Column mapping                                           │
│  ✅ Hasil analisis (summary statistik)                       │
│  ✅ AI insights                                              │
│  ✅ Generated report (HTML/PDF)                              │
│  ❌ File asli pengguna                                       │
│  ❌ Raw data dari spreadsheet                                │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Data Retention

| Data              | Retention            | Keterangan                       |
| ----------------- | -------------------- | -------------------------------- |
| File asli user    | 0 (tidak disimpan)   | Diproses di browser saja         |
| Upload metadata   | Selama akun aktif    | Soft delete tersedia             |
| Report            | Selama akun aktif    | Private storage + signed URL     |
| Payment records   | 5 tahun minimum      | Kebutuhan legal/tax              |
| Auth sessions     | Managed by Supabase  | Auto-expire                      |
| Logs (server)     | 30 hari              | Vercel default                   |

### 2.3 Consent & Transparency

- User diberi tahu bahwa data diproses di browser.
- Kebijakan privasi menjelaskan data apa yang disimpan di server.
- Label "Data Demo" pada data sintetis.
- Tidak ada tracking pihak ketiga di MVP selain analytics dasar.

---

## 3. API Security

### 3.1 Authentication

```
┌──────────────────────────────────────────┐
│            AUTH FLOW                      │
│                                          │
│  User ──▶ Supabase Auth                  │
│           │                              │
│           ├── Email + Password            │
│           └── Google OAuth                │
│                                          │
│  Session stored as:                      │
│  - HTTP-only cookie (server-side)        │
│  - Supabase client session (browser)     │
│                                          │
│  Setiap API request:                     │
│  1. Extract session dari cookie/header   │
│  2. Verify dengan Supabase              │
│  3. Reject jika invalid/expired          │
└──────────────────────────────────────────┘
```

### 3.2 Authorization Matrix

| Endpoint                     | Guest | Auth User | Owns Resource | Server Only |
| ---------------------------- | ----- | --------- | ------------- | ----------- |
| `GET /` (landing)            | ✅    | ✅        | —             | —           |
| `GET /demo`                  | ✅    | ✅        | —             | —           |
| `GET /upload`                | ❌    | ✅        | —             | —           |
| `POST /api/insight`          | ❌    | ✅        | ✅ (upload)   | —           |
| `POST /api/report`           | ❌    | ✅        | ✅ (upload)   | —           |
| `GET /api/report/[id]`       | ❌    | ✅        | ✅ (report)   | —           |
| `GET /api/report/[id]/pdf`   | ❌    | ✅        | ✅ (report)   | —           |
| `POST /api/webhook/payment`  | —     | —         | —             | ✅ (HMAC)   |
| Database INSERT payments     | —     | —         | —             | ✅          |
| Storage upload reports       | —     | —         | —             | ✅          |

### 3.3 Input Validation

Semua input divalidasi menggunakan **Zod** sebelum diproses:

```typescript
// Contoh: POST /api/insight
const InsightRequestSchema = z.object({
  uploadId: z.string().uuid(),
  consentGranted: z.literal(true),  // User HARUS setuju sebelum data dikirim ke AI
  summary: z.object({
    totalRows: z.number().int().positive().max(1_000_000),
    columns: z.array(z.object({
      name: z.string().max(100),
      type: z.enum(['numeric', 'date', 'categorical', 'text']),
      mapping: z.enum(['date', 'metric', 'category', 'identifier', 'description', 'ignore']),
    })).max(50),
    stats: z.record(z.string(), z.unknown()),
  }),
  sampleRows: z.array(z.record(z.string(), z.unknown())).max(10),
});
```

### 3.4 Rate Limiting

| Endpoint               | Limit         | Window    | Keterangan              |
| ---------------------- | ------------- | --------- | ----------------------- |
| `/api/insight`         | 10 requests   | 1 menit   | Gemini API cost         |
| `/api/report`          | 5 requests    | 1 menit   | Report generation       |
| `/api/webhook/payment` | 20 requests   | 1 menit   | Gateway callbacks       |
| Auth endpoints         | Managed by Supabase | —   | Built-in rate limit     |

### 3.5 Security Headers

```typescript
// next.config.ts — Security Headers
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",   // Diperlukan untuk SheetJS/DuckDB
      "style-src 'self' 'unsafe-inline'",   // Diperlukan untuk Tailwind
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];
```

---

## 4. Payment Security

### 4.1 Payment Flow (Server-Side Verification)

```
User (Browser)           Server (API Route)        Payment Gateway
     │                         │                         │
     │  1. Initiate payment    │                         │
     │  POST /api/payment      │                         │
     │────────────────────────▶│                         │
     │                         │  2. Create payment      │
     │                         │  POST gateway/create    │
     │                         │────────────────────────▶│
     │                         │                         │
     │                         │  3. Payment URL         │
     │                         │◀────────────────────────│
     │  4. Redirect to gateway │                         │
     │◀────────────────────────│                         │
     │                         │                         │
     │  5. User pays           │                         │
     │────────────────────────────────────────────────▶│
     │                         │                         │
     │                         │  6. Webhook callback    │
     │                         │  POST /api/webhook/pay  │
     │                         │◀────────────────────────│
     │                         │                         │
     │                         │  7. Verify HMAC sig     │
     │                         │  8. Update payment      │
     │                         │     status → 'paid'     │
     │                         │  9. Grant report access │
     │                         │                         │
     │  10. Redirect back      │                         │
     │◀────────────────────────────────────────────────│
     │                         │                         │
     │  11. Check access       │                         │
     │  GET /api/report/[id]   │                         │
     │────────────────────────▶│                         │
     │                         │  12. Verify payment     │
     │                         │      in DB (RLS)        │
     │  13. Report content     │                         │
     │◀────────────────────────│                         │
```

### 4.2 Payment Security Rules

| # | Rule                                              | Implementation                    |
|---|---------------------------------------------------|-----------------------------------|
| 1 | Jangan percaya status dari frontend               | Hanya update via webhook          |
| 2 | Verify webhook signature                          | HMAC-SHA256 comparison            |
| 3 | Idempotency — jangan proses webhook 2x            | Check `verified_at` sebelum update|
| 4 | Amount verification                               | Compare amount di webhook vs DB   |
| 5 | Payment timeout                                   | Expire pending payment setelah 1h |
| 6 | Credits tracking                                  | Atomic increment `credits_used`   |
| 7 | Tidak simpan data kartu di database               | Handled by payment gateway        |

### 4.3 Webhook Verification

```typescript
// Pseudocode — /api/webhook/payment/route.ts

async function POST(req: Request) {
  // 1. Get raw body + signature header
  const body = await req.text();
  const signature = req.headers.get('x-webhook-signature');

  // 2. Verify HMAC
  const expected = hmacSHA256(body, process.env.PAYMENT_WEBHOOK_SECRET);
  if (!timingSafeEqual(signature, expected)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. Parse + validate body with Zod
  const payload = WebhookPayloadSchema.parse(JSON.parse(body));

  // 4. Check idempotency
  const payment = await getPayment(payload.gateway_ref);
  if (payment.verified_at) {
    return Response.json({ status: 'already_processed' });
  }

  // 5. Verify amount matches
  if (payment.amount !== payload.amount) {
    await flagSuspiciousPayment(payment.id);
    return Response.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  // 6. Update payment status (service role)
  await updatePaymentStatus(payment.id, 'paid');

  return Response.json({ status: 'ok' });
}
```

---

## 5. Storage Access Control

### 5.1 Bucket Configuration

| Bucket    | Public | RLS  | Keterangan                          |
| --------- | ------ | ---- | ----------------------------------- |
| `reports` | ❌ No  | ✅   | Laporan berbayar, private only      |
| `avatars` | ✅ Yes | ✅   | Foto profil, public read            |

### 5.2 Signed URL Flow

```
User request report
     │
     ▼
Server verifies:
  1. User is authenticated
  2. User owns the report (RLS)
  3. Payment is verified (report_access table)
     │
     ▼
Generate signed URL:
  - Path: reports/{user_id}/{report_id}/report.pdf
  - Expiry: 3600 seconds (1 jam)
  - Download disposition
     │
     ▼
Return signed URL to client
     │
     ▼
Client downloads directly from Supabase Storage
```

### 5.3 File Upload Safety

Meskipun file asli TIDAK di-upload ke server, parsing di browser
tetap memerlukan perhatian:

| Risk                     | Mitigasi                                    |
| ------------------------ | ------------------------------------------- |
| Malicious macro (Excel)  | SheetJS tidak mengeksekusi macro             |
| Oversized file           | Client-side size check (max 10 MB)          |
| Invalid format           | Validate MIME type + file extension         |
| Memory exhaustion        | Limit row count processing (max 100K rows)  |
| XSS via cell content     | Sanitize semua string sebelum render di DOM |

---

## 6. Environment Security

### 6.1 Env Variable Classification

```
# .env.local — JANGAN commit ke git

# ✅ Safe for client (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ⚠️ SERVER ONLY — JANGAN gunakan NEXT_PUBLIC_ prefix
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
PAYMENT_SECRET_KEY=sk_...
PAYMENT_WEBHOOK_SECRET=whsec_...
```

### 6.2 Git Security

```gitignore
# .gitignore — WAJIB
.env
.env.local
.env.*.local
```

### 6.3 Build-time Checks

```typescript
// lib/env.ts — Runtime env validation
import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  PAYMENT_SECRET_KEY: z.string().min(1),
  PAYMENT_WEBHOOK_SECRET: z.string().min(1),
});

// Hanya dijalankan di server-side
export function validateServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Server env validation called on client!');
  }
  return serverEnvSchema.parse(process.env);
}
```

---

## 7. Security Checklist (Pre-Launch)

- [ ] Semua API key di server-side env vars (bukan `NEXT_PUBLIC_`)
- [ ] RLS aktif dan tested di semua tabel
- [ ] `.env.local` ada di `.gitignore`
- [ ] Payment webhook signature verification implemented
- [ ] Rate limiting aktif di semua API routes
- [ ] Security headers dikonfigurasi di `next.config.ts`
- [ ] Input validation (Zod) di semua API routes
- [ ] Signed URL expiry < 1 jam untuk reports
- [ ] File size limit enforced (client-side)
- [ ] XSS sanitization untuk data dari spreadsheet
- [ ] AI consent dialog tampil sebelum data dikirim ke Gemini
- [ ] API `/api/insight` menolak request tanpa `consentGranted: true`
- [ ] CORS configured (hanya domain sendiri)
- [ ] No sensitive data di Vercel build logs
- [ ] Supabase Auth rate limits configured
- [ ] CSP header configured dan tested

---

*Dokumen ini adalah bagian dari technical planning DataInsight Mini.*
*Referensi: [AGENTS.md](../AGENTS.md) | [ARCHITECTURE.md](./ARCHITECTURE.md) | [DATABASE.md](./DATABASE.md)*
