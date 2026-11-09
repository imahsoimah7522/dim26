// ===========================================
// DataInsight Mini — Upload Page
// ===========================================

import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Section } from "@/components/shared/section";
import { UploadPageClient } from "./client";

export const metadata: Metadata = {
  title: "Upload Data — DataInsight Mini",
  description:
    "Upload file Excel atau CSV untuk mendapatkan analisis dan insight bisnis.",
};

export default function UploadPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted">
        <Section className="pt-10 sm:pt-14">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                Upload Data Bisnis Anda
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Upload file spreadsheet Anda untuk memulai analisis data bisnis.
              </p>
            </div>
            <UploadPageClient />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
