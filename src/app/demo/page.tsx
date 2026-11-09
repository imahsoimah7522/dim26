// ===========================================
// DataInsight Mini — Demo Page
// ===========================================
// Menampilkan data sintetis sebagai contoh dashboard.
// Semua data di halaman ini adalah DATA DEMO, bukan data asli.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Section, SectionHeader } from "@/components/shared/section";
import { KPICard } from "@/components/dashboard/kpi-card";
import { InsightCard } from "@/components/insight/insight-card";
import {
  demoSalesData,
  demoProductData,
  demoCategoryData,
  demoKPIs,
  demoInsights,
} from "@/lib/demo/data";
import { DemoCharts } from "./charts";

export const metadata: Metadata = {
  title: "Demo — DataInsight Mini",
  description:
    "Lihat contoh dashboard dan analisis bisnis dengan data demo. Gratis, tanpa registrasi.",
};

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted">
        {/* Header */}
        <Section className="bg-white pb-8 pt-10 sm:pb-10 sm:pt-14">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Data Demo — Bukan Data Asli
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Contoh Dashboard Bisnis
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
              Ini adalah contoh analisis menggunakan data sintetis warung kopi.
              Upload data Anda sendiri untuk mendapatkan insight yang relevan.
            </p>
          </div>
        </Section>

        {/* KPI Cards */}
        <Section className="py-0 sm:py-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoKPIs.map((kpi) => (
              <KPICard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                changeLabel={kpi.changeLabel}
              />
            ))}
          </div>
        </Section>

        {/* Charts (Client Component) */}
        <Section className="py-6 sm:py-8">
          <DemoCharts
            salesData={demoSalesData}
            productData={demoProductData}
            categoryData={demoCategoryData}
          />
        </Section>

        {/* AI Insights */}
        <Section className="py-6 sm:py-8">
          <SectionHeader
            title="Insight Bisnis dari AI"
            subtitle="Rekomendasi berdasarkan analisis data demo"
            className="mb-6"
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {demoInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section className="bg-white py-12 sm:py-16">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-navy-900 sm:text-2xl">
              Ingin Menganalisis Data Bisnis Anda?
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Upload file Excel atau CSV Anda dan dapatkan insight yang relevan
              untuk bisnis Anda sendiri.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-navy-800 px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
            >
              Upload Data Anda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
