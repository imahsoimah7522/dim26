// ===========================================
// DataInsight Mini — Landing Page
// ===========================================

import Link from "next/link";
import {
  BarChart3,
  Upload,
  Brain,
  Shield,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Section, SectionHeader } from "@/components/shared/section";
import { PricingCard } from "@/components/shared/pricing-card";
import { LandingFAQ } from "./faq";

// ─── Hero ────────────────────────────────────────
function Hero() {
  return (
    <Section className="bg-white pt-12 pb-8 sm:pt-16 sm:pb-10">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
          <BarChart3 className="h-3.5 w-3.5" />
          Simple Business Analytics
        </span>

        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-navy-900 sm:text-4xl md:text-5xl">
          Ubah Data Bisnis Anda Menjadi{" "}
          <span className="text-accent-600">Insight yang Jelas</span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Upload file Excel atau CSV, dapatkan dashboard interaktif dan
          rekomendasi AI dalam hitungan menit. Dirancang khusus untuk UMKM
          Indonesia.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent-600 px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 sm:h-13 sm:px-10 sm:text-base"
          >
            Lihat Demo Gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Upload className="h-4 w-4" />
            Upload Data Anda
          </Link>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Mulai dari Rp29.000 per laporan &bull; Tidak perlu kartu kredit
        </p>
      </div>
    </Section>
  );
}

// ─── Product Preview ─────────────────────────────
function ProductPreview() {
  return (
    <Section className="bg-muted py-4 sm:py-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-border bg-navy-50 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-muted-foreground">
            DataInsight Mini — Dashboard
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-3 sm:p-6">
          {[
            { label: "Total Penjualan", value: "Rp244,7 jt", color: "text-accent-600" },
            { label: "Transaksi", value: "5.240", color: "text-navy-800" },
            { label: "Rata-rata", value: "Rp46.700", color: "text-navy-800" },
            { label: "Pertumbuhan", value: "+23,5%", color: "text-success" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg bg-muted p-2.5 text-center sm:p-3"
            >
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{kpi.label}</p>
              <p className={`mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg ${kpi.color}`}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center border-t border-border bg-muted px-3 py-4 sm:px-6 sm:py-6">
          <div className="flex w-full max-w-md flex-col items-center gap-1">
            {/* Simplified chart placeholder bars */}
            <div className="flex h-16 w-full items-end justify-between gap-1 sm:h-24 sm:gap-1.5">
              {[35, 42, 55, 40, 62, 72, 65, 75, 84, 78, 89, 100].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-accent-500 transition-all"
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Jan — Des 2024
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Features ────────────────────────────────────
const features = [
  {
    icon: FileSpreadsheet,
    title: "Upload Mudah",
    description:
      "Cukup drag & drop file Excel atau CSV Anda. Sistem akan otomatis mendeteksi kolom dan tipe data.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Interaktif",
    description:
      "Lihat tren penjualan, produk terlaris, dan distribusi kategori dalam grafik yang mudah dipahami.",
  },
  {
    icon: Brain,
    title: "AI Insight",
    description:
      "Dapatkan rekomendasi bisnis berbasis AI dalam Bahasa Indonesia. Langkah aksi yang bisa diterapkan.",
  },
  {
    icon: Shield,
    title: "Data Aman",
    description:
      "File diproses langsung di browser Anda. Data tidak disimpan di server tanpa izin Anda.",
  },
] as const;

function Features() {
  return (
    <Section className="bg-white">
      <SectionHeader
        title="Fitur Utama"
        subtitle="Semua yang Anda butuhkan untuk memahami data bisnis Anda"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-navy-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── How It Works ────────────────────────────────
const steps = [
  {
    step: "1",
    title: "Upload File",
    description: "Upload file Excel (.xlsx, .xls) atau CSV dari komputer Anda.",
  },
  {
    step: "2",
    title: "Mapping Kolom",
    description: "Pilih kolom mana yang berisi tanggal, produk, jumlah, dan harga.",
  },
  {
    step: "3",
    title: "Lihat Dashboard",
    description: "Dapatkan dashboard interaktif dengan grafik dan KPI secara instan.",
  },
  {
    step: "4",
    title: "Baca Insight AI",
    description: "Terima rekomendasi bisnis berbasis AI dalam Bahasa Indonesia.",
  },
] as const;

function HowItWorks() {
  return (
    <Section className="bg-muted">
      <SectionHeader
        title="Cara Kerja"
        subtitle="Dari data mentah ke insight bisnis dalam 4 langkah"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.step} className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-lg font-bold text-white">
              {step.step}
            </div>
            <h3 className="text-base font-semibold text-navy-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Pricing ─────────────────────────────────────
function Pricing() {
  return (
    <Section id="pricing" className="bg-white">
      <SectionHeader
        title="Harga Sederhana"
        subtitle="Bayar per laporan, tanpa langganan bulanan"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PricingCard
          name="Demo Gratis"
          price="Gratis"
          description="Coba dengan data contoh"
          features={[
            "Data demo (bukan data Anda)",
            "Dashboard interaktif",
            "Grafik & visualisasi",
            "Preview insight AI",
          ]}
          ctaLabel="Coba Demo"
          ctaHref="/demo"
        />
        <PricingCard
          name="Single Report"
          price="Rp29.000"
          priceNote="/ laporan"
          description="Satu laporan analisis lengkap"
          features={[
            "Upload data Anda sendiri",
            "Dashboard lengkap",
            "5 insight AI",
            "Export PDF",
            "Berlaku selamanya",
          ]}
          ctaLabel="Beli Laporan"
          ctaHref="/upload"
          highlighted
          badge="Populer"
        />
        <PricingCard
          name="Business Pack"
          price="Rp79.000"
          priceNote="/ 5 laporan"
          description="Paket hemat untuk bisnis"
          features={[
            "5 laporan analisis",
            "Semua fitur Single Report",
            "Hemat 45%",
            "Ideal untuk analisis rutin",
            "Berlaku selamanya",
          ]}
          ctaLabel="Beli Paket"
          ctaHref="/upload"
        />
      </div>
    </Section>
  );
}

// ─── CTA Bottom ──────────────────────────────────
function CTABottom() {
  return (
    <Section className="bg-navy-900">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Siap Memahami Data Bisnis Anda?
        </h2>
        <p className="mt-3 max-w-md text-base text-navy-300">
          Mulai dengan demo gratis, tanpa perlu registrasi atau kartu kredit.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-100"
          >
            Lihat Demo Gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-navy-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Lihat Harga
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── Page ────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProductPreview />
        <Features />
        <HowItWorks />
        <Pricing />
        <LandingFAQ />
        <CTABottom />
      </main>
      <Footer />
    </>
  );
}
