# DATABASE — DataInsight Mini

> Desain database dan kebijakan keamanan data  
> Versi: 1.0 | Terakhir diperbarui: 5 November 2026

> [!CAUTION]
> Dokumen ini adalah **desain**. Jangan buat tabel database sebelum
> mendapat persetujuan eksplisit dari pemilik proyek (AGENTS.md Working Method).

---

## 1. Overview

Database menggunakan **Supabase PostgreSQL** dengan **Row Level Security
(RLS)** aktif di semua tabel yang menyimpan data pengguna.

### Prinsip Desain
- Semua tabel user-facing memiliki RLS aktif.
- Foreign key constraint untuk integritas referensial.
- Soft delete (kolom `deleted_at`) untuk data penting.
- Timestamp `created_at` dan `updated_at` di semua tabel.
- UUID sebagai primary key.

---

## 2. Entity Relationship Diagram

```
┌───────────────┐       ┌────────────────────┐       ┌──────────────────┐
│    profiles    │       │      uploads       │       │     reports      │
├───────────────┤       ├────────────────────┤       ├──────────────────┤
│ id (PK, FK)   │──1:N──│ id (PK)            │──1:1──│ id (PK)          │
│ email         │       │ user_id (FK)       │       │ upload_id (FK)   │
│ full_name     │       │ file_name          │       │ user_id (FK)     │
│ created_at    │       │ file_size          │       │ title            │
│ updated_at    │       │ file_type          │       │ status           │
└───────────────┘       │ column_count       │       │ summary_json     │
       │                │ row_count          │       │ insights_json    │
       │                │ column_mapping     │       │ storage_path     │
       │                │ status             │       │ created_at       │
       │                │ created_at         │       │ updated_at       │
       │                │ updated_at         │       └──────────────────┘
       │                └────────────────────┘
       │
       │         ┌────────────────────┐       ┌──────────────────┐
       │         │     payments       │       │  report_access   │
       │         ├────────────────────┤       ├──────────────────┤
       └──1:N────│ id (PK)            │       │ id (PK)          │
                 │ user_id (FK)       │──1:N──│ payment_id (FK)  │
                 │ type               │       │ report_id (FK)   │
                 │ amount             │       │ granted_at       │
                 │ status             │       │ expires_at       │
                 │ gateway_ref        │       └──────────────────┘
                 │ gateway_response   │
                 │ credits_total      │
                 │ credits_used       │
                 │ verified_at        │
                 │ created_at         │
                 │ updated_at         │
                 └────────────────────┘
```

---

## 3. Definisi Tabel

### 3.1 `profiles`

Menyimpan informasi profil pengguna. Tabel ini di-sync dari
`auth.users` Supabase menggunakan trigger.

```sql
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 3.2 `uploads`

Menyimpan metadata file yang di-upload pengguna.
**File asli TIDAK disimpan di server** — hanya metadata.

```sql
CREATE TABLE public.uploads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name       TEXT NOT NULL,
  file_size       INTEGER NOT NULL,                   -- bytes
  file_type       TEXT NOT NULL,                       -- xlsx, xls, csv
  column_count    INTEGER,
  row_count       INTEGER,
  column_mapping  JSONB,                               -- { "Produk": "category", ... }
  column_metadata JSONB,                               -- detected types, samples
  status          TEXT NOT NULL DEFAULT 'mapped'
                  CHECK (status IN ('uploaded', 'parsed', 'mapped', 'analyzed', 'failed')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_status ON public.uploads(status);
CREATE INDEX idx_uploads_created_at ON public.uploads(created_at DESC);

-- RLS
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
  ON public.uploads FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own uploads"
  ON public.uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads"
  ON public.uploads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete own uploads"
  ON public.uploads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.3 `reports`

Menyimpan metadata dan hasil analisis laporan.

```sql
CREATE TABLE public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id       UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  summary_json    JSONB,                               -- statistik hasil analisis
  insights_json   JSONB,                               -- AI insights dari Gemini
  ai_consent_at   TIMESTAMPTZ,                          -- kapan user setuju kirim data ke AI
  chart_config    JSONB,                               -- konfigurasi chart
  storage_path    TEXT,                                 -- path di Supabase Storage
  is_demo         BOOLEAN NOT NULL DEFAULT false,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_upload_id ON public.reports(upload_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.4 `payments`

Menyimpan data transaksi pembayaran.

```sql
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type              TEXT NOT NULL
                    CHECK (type IN ('single_report', 'business_pack')),
  amount            INTEGER NOT NULL,                  -- dalam Rupiah
  currency          TEXT NOT NULL DEFAULT 'IDR',
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'expired')),
  gateway_ref       TEXT,                               -- ID dari payment gateway
  gateway_response  JSONB,                              -- raw response dari gateway
  credits_total     INTEGER NOT NULL DEFAULT 1,         -- 1 untuk single, 5 untuk pack
  credits_used      INTEGER NOT NULL DEFAULT 0,
  verified_at       TIMESTAMPTZ,                        -- timestamp verifikasi webhook
  expires_at        TIMESTAMPTZ,                        -- expiry untuk pending payments
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_gateway_ref ON public.payments(gateway_ref);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT dan UPDATE hanya melalui service role (server-side)
-- Tidak ada policy INSERT/UPDATE untuk user — payment harus melalui server
```

### 3.5 `report_access`

Junction table yang menghubungkan payment dengan report.
Memberikan akses report berdasarkan pembayaran yang terverifikasi.

```sql
CREATE TABLE public.report_access (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id  UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  report_id   UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,                             -- NULL = tidak expire

  UNIQUE(payment_id, report_id)
);

-- Indexes
CREATE INDEX idx_report_access_user_id ON public.report_access(user_id);
CREATE INDEX idx_report_access_report_id ON public.report_access(report_id);
CREATE INDEX idx_report_access_payment_id ON public.report_access(payment_id);

-- RLS
ALTER TABLE public.report_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access"
  ON public.report_access FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT hanya melalui service role (setelah payment verified)
```

---

## 4. Supabase Storage Buckets

| Bucket          | Akses    | Keterangan                              |
| --------------- | -------- | --------------------------------------- |
| `reports`       | Private  | File laporan HTML/PDF                   |
| `avatars`       | Public   | Foto profil pengguna                    |

### Storage Policies (Bucket `reports`)

```sql
-- Hanya user pemilik yang bisa membaca file reportnya
CREATE POLICY "Users can read own reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert hanya melalui service role (server-side)
-- Tidak ada policy INSERT untuk user biasa
```

### Struktur Path Storage

```
reports/
  {user_id}/
    {report_id}/
      report.html
      report.pdf
```

---

## 5. Database Functions & Triggers

### 5.1 Auto-create Profile on Signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 5.2 Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply ke semua tabel
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 5.3 Check Report Credit Before Access

```sql
CREATE OR REPLACE FUNCTION public.check_report_credit(
  p_user_id UUID,
  p_payment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_credits_total INTEGER;
  v_credits_used INTEGER;
  v_status TEXT;
BEGIN
  SELECT credits_total, credits_used, status
  INTO v_credits_total, v_credits_used, v_status
  FROM public.payments
  WHERE id = p_payment_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  RETURN v_status = 'paid' AND v_credits_used < v_credits_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Data Flow Summary

```
User signup
  │
  ▼ [trigger: handle_new_user]
profiles (auto-created)
  │
  ▼ User upload file
uploads (metadata saja, file diproses di browser)
  │
  ▼ Column mapping selesai
uploads.column_mapping diupdate
  │
  ▼ User bayar
payments (status: pending)
  │
  ▼ Webhook dari gateway
payments (status: paid, verified_at: now)
  │
  ▼ Generate report
reports (status: completed)
  │
  ▼ Simpan file report
Supabase Storage → reports/{user_id}/{report_id}/
  │
  ▼ Grant access
report_access (payment_id + report_id)
  │
  ▼ User akses report
Signed URL (expiry 24 jam)
```

---

## 7. Query Patterns

### Cek apakah user punya kredit tersisa

```sql
SELECT id, type, credits_total, credits_used,
       (credits_total - credits_used) AS credits_remaining
FROM public.payments
WHERE user_id = $1
  AND status = 'paid'
  AND credits_used < credits_total
ORDER BY created_at DESC
LIMIT 1;
```

### Ambil semua report user

```sql
SELECT r.*, ra.granted_at
FROM public.reports r
JOIN public.report_access ra ON ra.report_id = r.id
WHERE r.user_id = $1
  AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;
```

### Hitung total pendapatan

```sql
-- Hanya via service role (admin dashboard)
SELECT
  type,
  COUNT(*) AS total_transactions,
  SUM(amount) AS total_revenue
FROM public.payments
WHERE status = 'paid'
GROUP BY type;
```

---

## 8. Migrasi & Versioning

- Migrasi database menggunakan **Supabase CLI** (`supabase db diff`
  dan `supabase db push`).
- Setiap migrasi disimpan di `supabase/migrations/`.
- Migrasi dijalankan secara sequential berdasarkan timestamp.
- **Tidak ada migrasi yang boleh dieksekusi tanpa persetujuan.**

---

*Dokumen ini adalah bagian dari technical planning DataInsight Mini.*
*Referensi: [AGENTS.md](../AGENTS.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
