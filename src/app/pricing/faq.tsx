// ===========================================
// DataInsight Mini — Pricing FAQ
// ===========================================

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Apa perbedaan Single Report dan Business Pack?",
    answer:
      "Single Report memberikan satu laporan analisis lengkap seharga Rp29.000. Business Pack berisi 5 laporan seharga Rp79.000 (Rp15.800/laporan), hemat 45%. Pilih Business Pack jika Anda ingin menganalisis data secara rutin.",
  },
  {
    question: "Bagaimana cara pembayarannya?",
    answer:
      "Pembayaran dilakukan per laporan (pay-per-report) melalui transfer bank atau e-wallet. Tidak ada biaya langganan bulanan atau tahunan.",
  },
  {
    question: "Apakah laporan memiliki masa berlaku?",
    answer:
      "Tidak. Semua laporan yang sudah dibeli berlaku selamanya. Anda bisa mengakses dan mengunduh ulang kapan saja.",
  },
  {
    question: "Bisa refund jika tidak puas?",
    answer:
      "Ya, kami menawarkan garansi uang kembali dalam 7 hari jika Anda tidak puas dengan kualitas laporan. Hubungi tim support kami.",
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

export function PricingFAQ() {
  return (
    <Section className="bg-white">
      <SectionHeader
        title="Pertanyaan Seputar Harga"
        subtitle="Jawaban untuk pertanyaan umum tentang pembayaran"
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
