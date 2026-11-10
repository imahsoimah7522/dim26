// ===========================================
// DataInsight Mini — Consent Dialog
// ===========================================
// Asks user permission before sending data to AI.

"use client";

import { ShieldCheck, X } from "lucide-react";

interface ConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentDialog({ onAccept, onDecline }: ConsentDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onDecline}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-navy-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <ShieldCheck className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-navy-900">
          Persetujuan Penggunaan AI
        </h3>

        {/* Description */}
        <div className="mt-3 space-y-2 text-sm text-navy-700">
          <p>
            Untuk menghasilkan insight bisnis, ringkasan analisis Anda akan
            dikirim ke Open Source AI untuk dianalisis.
          </p>
          <p className="font-medium">Yang akan dikirim:</p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>KPI dan metrik agregat (bukan data mentah)</li>
            <li>Tren bulanan yang sudah dirangkum</li>
            <li>Peringkat produk dan kategori</li>
            <li>Temuan kualitas data</li>
          </ul>
          <p className="font-medium">Yang TIDAK dikirim:</p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>File asli yang Anda upload</li>
            <li>Data baris per baris</li>
            <li>Informasi pribadi atau akun</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
          >
            Setuju & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
