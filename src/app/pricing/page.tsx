// ===========================================
// DataInsight Mini — Pricing Page
// ===========================================

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Section, SectionHeader } from "@/components/shared/section";
import { PricingCard } from "@/components/shared/pricing-card";
import { PricingFAQ } from "./faq";

export const metadata: Metadata = {
  title: "Harga — DataInsight Mini",
  description:
    "Harga sederhana, bayar per laporan. Mulai dari Rp29.000 tanpa biaya langganan.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <Section className="bg-white pt-10 pb-6 sm:pt-14 sm:pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl md:text-4xl">
              Harga Sederhana, Tanpa Langganan
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Bayar hanya untuk laporan yang Anda butuhkan. Tidak ada biaya
              bulanan atau tersembunyi.
            </p>
          </div>
        </Section>

        {/* Pricing Cards */}
        <Section className="bg-white py-6 sm:py-8">
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
                "Tanpa registrasi",
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
                "Dashboard lengkap & interaktif",
                "5 insight AI berbahasa Indonesia",
                "Export laporan PDF",
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
                "5 laporan analisis lengkap",
                "Semua fitur Single Report",
                "Hemat 45% dibanding beli satuan",
                "Ideal untuk analisis rutin",
                "Berlaku selamanya",
              ]}
              ctaLabel="Beli Paket"
              ctaHref="/upload"
            />
          </div>
        </Section>

        {/* Comparison Table */}
        <Section className="bg-muted">
          <SectionHeader
            title="Perbandingan Fitur"
            subtitle="Lihat fitur lengkap setiap paket"
          />
          <div className="mx-auto max-w-3xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-medium text-muted-foreground">
                    Fitur
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Demo
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-accent-600">
                    Single
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { feature: "Dashboard interaktif", demo: true, single: true, business: true },
                  { feature: "Upload data sendiri", demo: false, single: true, business: true },
                  { feature: "AI Insight (Bahasa Indonesia)", demo: "Preview", single: "5 insight", business: "5 insight/laporan" },
                  { feature: "Export PDF", demo: false, single: true, business: true },
                  { feature: "Jumlah laporan", demo: "—", single: "1", business: "5" },
                  { feature: "Masa berlaku", demo: "—", single: "Selamanya", business: "Selamanya" },
                  { feature: "Harga per laporan", demo: "Gratis", single: "Rp29.000", business: "Rp15.800" },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3 font-medium text-navy-800">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.demo === "boolean" ? (
                        row.demo ? (
                          <span className="text-success">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {row.demo}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.single === "boolean" ? (
                        row.single ? (
                          <span className="text-success">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-xs font-medium text-navy-800">
                          {row.single}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.business === "boolean" ? (
                        row.business ? (
                          <span className="text-success">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-xs font-medium text-navy-800">
                          {row.business}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* FAQ */}
        <PricingFAQ />

        {/* CTA */}
        <Section className="bg-navy-900">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Mulai Analisis Data Bisnis Anda
            </h2>
            <p className="mt-2 max-w-md text-sm text-navy-300">
              Coba demo gratis dulu, atau langsung upload data Anda.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-100"
              >
                Coba Demo Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-navy-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
              >
                Upload Data
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
