// ===========================================
// DataInsight Mini — FAQ Section (Landing Page)
// ===========================================

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Format file apa saja yang didukung?",
    answer:
      "DataInsight Mini mendukung file Excel (.xlsx, .xls) dan CSV (.csv). Pastikan data Anda memiliki header kolom di baris pertama.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Ya. File Anda diproses langsung di browser menggunakan teknologi client-side processing. Data tidak dikirim ke server kecuali Anda secara eksplisit menyetujui untuk mendapatkan insight AI.",
  },
  {
    question: "Berapa lama laporan saya berlaku?",
    answer:
      "Laporan yang sudah dibeli berlaku selamanya. Anda bisa mengakses dan mengunduh ulang kapan saja.",
  },
  {
    question: "Apakah ada biaya langganan?",
    answer:
      "Tidak. DataInsight Mini menggunakan model bayar per laporan (pay-per-report). Tidak ada biaya bulanan atau tahunan.",
  },
  {
    question: "Berapa ukuran file maksimal?",
    answer:
      "Ukuran file maksimal adalah 10 MB dengan maksimal 100.000 baris data. Ini cukup untuk kebanyakan data bisnis UMKM.",
  },
  {
    question: "Apakah insight AI tersedia dalam Bahasa Indonesia?",
    answer:
      "Ya. Semua insight dan rekomendasi bisnis ditulis dalam Bahasa Indonesia yang mudah dipahami.",
  },
] as const;

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-navy-900 transition-colors hover:text-accent-600"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {question}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}

export function LandingFAQ() {
  return (
    <Section className="bg-muted">
      <SectionHeader
        title="Pertanyaan Umum"
        subtitle="Jawaban untuk pertanyaan yang sering diajukan"
      />
      <div className="mx-auto max-w-2xl">
        {faqs.map((faq) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </Section>
  );
}
