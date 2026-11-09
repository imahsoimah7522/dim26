// ===========================================
// Payment Instructions Component — DataInsight Mini
// ===========================================

import { Copy, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, type PaymentInstructions } from "@/features/payment";

interface PaymentInstructionsCardProps {
  instructions: PaymentInstructions;
}

export function PaymentInstructionsCard({
  instructions,
}: PaymentInstructionsCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const expiresDate = new Date(instructions.expiresAt);
  const expiresFormatted = expiresDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-navy-900">
        <Building2 className="h-4 w-4 text-accent-600" />
        Instruksi Pembayaran
      </div>

      {/* Bank details */}
      <div className="space-y-3 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Bank</p>
            <p className="text-sm font-semibold text-navy-900">
              {instructions.bankName}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Nomor Rekening</p>
            <p className="text-sm font-mono font-semibold text-navy-900">
              {instructions.accountNumber}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(instructions.accountNumber)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Atas Nama</p>
          <p className="text-sm font-semibold text-navy-900">
            {instructions.accountHolder}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Jumlah Transfer</p>
            <p className="text-lg font-bold text-accent-600">
              {formatRupiah(instructions.amount)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(instructions.amount.toString())}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Order reference */}
      <div className="flex items-center justify-between rounded-lg bg-accent-50 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Referensi Order</p>
          <p className="text-sm font-mono font-bold text-accent-700">
            {instructions.orderReference}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(instructions.orderReference)}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Expiry */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Bayar sebelum {expiresFormatted}
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">💡 Penting:</p>
        <ul className="mt-1 space-y-0.5">
          <li>• Transfer tepat sesuai jumlah di atas.</li>
          <li>
            • Cantumkan kode referensi{" "}
            <strong>{instructions.orderReference}</strong> pada berita transfer.
          </li>
          <li>• Pembayaran akan dikonfirmasi dalam 1x24 jam.</li>
        </ul>
      </div>
    </div>
  );
}
