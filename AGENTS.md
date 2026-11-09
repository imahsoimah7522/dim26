# AGENTS.md — DataInsight Mini

> Dokumen ini adalah sumber kebenaran untuk semua AI agent dan developer
> yang bekerja pada proyek DataInsight Mini. Semua aturan di bawah ini
> bersifat **wajib** dan harus dipatuhi tanpa pengecualian.

---

## PRODUCT

**DataInsight Mini** adalah aplikasi analisis data bisnis untuk **UMKM dan
pemilik usaha di Indonesia**. Aplikasi ini membantu pengguna memahami data
bisnis mereka melalui laporan analisis yang mudah dipahami, visualisasi
interaktif, dan insight yang dapat ditindaklanjuti.

---

## BUSINESS MODEL

| Tier             | Harga      | Keterangan                          |
| ---------------- | ---------- | ----------------------------------- |
| Free Demo        | Gratis     | Akses terbatas untuk mencoba fitur  |
| Paid Report      | Rp29.000   | Satu laporan analisis lengkap       |
| Business Pack    | Rp79.000   | Paket laporan untuk kebutuhan bisnis|

- **Model pembayaran: per laporan** (pay-per-report), bukan langganan.
- Tidak ada subscription bulanan/tahunan.
- Setiap pembelian menghasilkan satu atau satu paket laporan.

---

## TECHNOLOGY

### Frontend & UI
- **Next.js App Router** — framework utama.
- **TypeScript strict mode** — wajib untuk semua file `.ts` dan `.tsx`.
- **Tailwind CSS** — styling utility-first.
- **shadcn/ui** — komponen UI yang konsisten dan accessible.
- **Recharts** — visualisasi data dan grafik.

### Data Processing
- **SheetJS** — parsing dan pemrosesan file spreadsheet (Excel, CSV).
- **DuckDB-Wasm** — query engine di browser, digunakan jika diperlukan
  untuk pemrosesan data yang kompleks.

### Backend & Infrastructure
- **Supabase PostgreSQL** — database utama.
- **Supabase Auth** — autentikasi pengguna.
- **Supabase Storage** — penyimpanan file (upload dan laporan).
- **Gemini API** — AI untuk menghasilkan insight dan analisis.
- **Vercel** — hosting dan deployment.

---

## DEVELOPMENT RULES

1. **Selalu periksa codebase sebelum mengubah kode.**
   Pahami konteks, dependensi, dan dampak perubahan sebelum menulis kode.

2. **Jangan menulis ulang modul yang sudah berjalan tanpa alasan.**
   Refactoring hanya boleh dilakukan jika ada justifikasi teknis yang jelas
   (bug, performa, atau kebutuhan arsitektur baru).

3. **Pisahkan UI, business logic, dan data processing.**
   Gunakan arsitektur berlapis:
   - `components/` — UI dan presentasi.
   - `lib/` atau `services/` — business logic.
   - `lib/processing/` — data processing dan transformasi.

4. **Gunakan komponen reusable.**
   Hindari duplikasi. Ekstrak komponen yang digunakan lebih dari sekali
   ke dalam shared components.

5. **Gunakan TypeScript strict mode.**
   `tsconfig.json` harus memiliki `"strict": true`. Tidak boleh menggunakan
   `any` kecuali benar-benar tidak dapat dihindari dan didokumentasikan.

6. **Gunakan Zod untuk validasi input dan output.**
   Semua data dari user input, API response, dan file upload harus
   divalidasi dengan skema Zod sebelum diproses.

7. **Jangan membuat dummy functionality yang diklaim sudah berfungsi.**
   Jika sebuah fitur belum diimplementasikan, tandai dengan jelas
   (misalnya `// TODO:` atau throw `NotImplementedError`), jangan buat
   fungsi kosong atau placeholder yang terlihat seolah-olah bekerja.

8. **Jangan menggunakan data palsu untuk hasil analisis pelanggan.**
   Semua insight dan analisis yang ditampilkan kepada pengguna berbayar
   harus berasal dari data asli mereka, bukan data hardcoded atau acak.

9. **Gunakan data sintetis hanya untuk demo.**
   Data sintetis hanya boleh digunakan di mode demo untuk menunjukkan
   kemampuan aplikasi. Harus diberi label jelas sebagai "Data Demo".

10. **Tulis unit test untuk perhitungan statistik.**
    Semua fungsi kalkulasi, agregasi, dan statistik harus memiliki unit
    test yang memverifikasi keakuratan hasilnya.

11. **Jalankan lint, typecheck, dan test setelah implementasi.**
    Setiap perubahan kode harus lulus:
    - `eslint` — tanpa error.
    - `tsc --noEmit` — tanpa error.
    - `jest` / `vitest` — semua test pass.

12. **Perbarui dokumentasi setelah perubahan arsitektur.**
    Jika arsitektur, alur data, atau API berubah, dokumentasi terkait
    (termasuk file ini) harus diperbarui dalam PR yang sama.

---

## SECURITY

1. **Jangan pernah mengekspos service role key.**
   Supabase service role key hanya boleh digunakan di server-side
   (API routes, server actions). Tidak boleh ada di kode client.

2. **Jangan mengekspos Gemini API key.**
   Gemini API key harus disimpan di environment variable server-side
   (`GEMINI_API_KEY`). Semua panggilan ke Gemini harus melalui API route.

3. **Jangan mengekspos payment secret.**
   Payment webhook secret dan API key hanya boleh ada di server-side.
   Gunakan environment variable yang tidak di-prefix dengan `NEXT_PUBLIC_`.

4. **Aktifkan RLS pada tabel pengguna.**
   Semua tabel yang menyimpan data pengguna harus memiliki Row Level
   Security (RLS) yang aktif. User hanya boleh mengakses data miliknya.

5. **Jangan percaya payment status dari frontend.**
   Status pembayaran harus diverifikasi di server-side melalui webhook
   atau API call langsung ke payment provider. Jangan pernah menggunakan
   data dari client untuk menentukan akses ke konten berbayar.

6. **Validasi semua input.**
   Semua input dari pengguna — form, query parameter, file upload,
   API request body — harus divalidasi dan disanitasi di server-side.

7. **Jangan mengirim file mentah ke AI secara default.**
   File yang diupload pengguna harus diproses dan diekstrak terlebih
   dahulu. Hanya kirim data yang relevan (summary, statistik, sampel)
   ke Gemini API, bukan seluruh file mentah.

8. **Proses file di browser jika memungkinkan.**
   Gunakan SheetJS dan/atau DuckDB-Wasm untuk memproses file di
   client-side. Ini mengurangi beban server dan meningkatkan privasi data.

9. **Gunakan private storage untuk laporan berbayar.**
   Laporan hasil analisis berbayar harus disimpan di Supabase Storage
   bucket yang bersifat private. Akses hanya melalui signed URL
   dengan expiry time.

---

## WORKING METHOD

- **Untuk pekerjaan besar, buat implementation plan terlebih dahulu.**
  Tulis rencana yang mencakup fase, deliverables, dan dependensi
  sebelum mulai coding.

- **Jangan langsung mengimplementasikan semua fase.**
  Selesaikan satu fase sepenuhnya (termasuk test) sebelum pindah
  ke fase berikutnya.

- **Kerjakan satu fase dalam satu waktu.**
  Fokus pada satu scope pekerjaan agar perubahan tetap kecil,
  mudah di-review, dan mudah di-rollback.

- **Laporkan file yang dibuat dan diubah.**
  Setiap selesai implementasi, berikan daftar lengkap file yang
  dibuat baru dan file yang dimodifikasi.

- **Tampilkan hasil pengujian yang benar-benar dijalankan.**
  Jangan mengklaim "semua test pass" tanpa benar-benar menjalankannya.
  Tampilkan output dari test runner.

- **Berhenti dan minta persetujuan sebelum perubahan kritis.**
  Perubahan pada area berikut memerlukan persetujuan eksplisit
  dari pemilik proyek sebelum dieksekusi:
  - 🗄️ **Database** — migrasi skema, perubahan tabel, modifikasi RLS.
  - 💳 **Pembayaran** — integrasi payment gateway, perubahan harga.
  - 🔒 **Keamanan** — perubahan autentikasi, otorisasi, atau enkripsi.
  - 🚀 **Deployment produksi** — deploy ke environment production.

---

*Dokumen ini terakhir diperbarui: 5 November 2026.*

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
