// ===========================================
// Purchase Dialog Component — DataInsight Mini
// ===========================================
// Dialog untuk memilih tier dan membeli laporan.

"use client";

import { useState, useTransition } from "react";
import {
  FileText,
  Package,
  Loader2,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentInstructionsCard } from "./payment-instructions";
import { createPaymentOrder } from "@/features/payment/payment-service";
import {
  PAYMENT_TIERS,
  formatRupiah,
  type PaidTier,
  type PaymentInstructions,
} from "@/features/payment";

interface PurchaseDialogProps {
  analysisId: string;
  onClose: () => void;
}

const TIER_OPTIONS: Array<{
  tier: PaidTier;
  icon: typeof FileText;
  features: string[];
}> = [
  {
    tier: "paid_report",
    icon: FileText,
    features: [
      "1 laporan PDF profesional",
      "Tanpa watermark",
      "Analisis lengkap",
      "AI insights",
    ],
  },
  {
    tier: "business_pack",
    icon: Package,
    features: [
      "5 laporan PDF profesional",
      "Tanpa watermark",
      "Hemat 45%",
      "Berlaku selamanya",
    ],
  },
];

export function PurchaseDialog({ analysisId, onClose }: PurchaseDialogProps) {
  const [selectedTier, setSelectedTier] = useState<PaidTier | null>(null);
  const [instructions, setInstructions] =
    useState<PaymentInstructions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePurchase = () => {
    if (!selectedTier) return;

    startTransition(async () => {
      setError(null);
      const result = await createPaymentOrder({
        analysisId,
        tier: selectedTier,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data?.instructions) {
        setInstructions(result.data.instructions);
      }
    });
  };

  // Show payment instructions after order created
  if (instructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-navy-900">
                Order Dibuat
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <div className="p-4">
            <PaymentInstructionsCard instructions={instructions} />
            <Button onClick={onClose} className="mt-4 w-full" variant="outline">
              Tutup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tier selection
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent-600" />
            <h2 className="text-lg font-semibold text-navy-900">
              Beli Laporan Premium
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tier options */}
        <div className="space-y-3 p-4">
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {TIER_OPTIONS.map(({ tier, icon: Icon, features }) => {
            const config = PAYMENT_TIERS[tier];
            const isSelected = selectedTier === tier;

            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  isSelected
                    ? "border-accent-600 bg-accent-50"
                    : "border-border hover:border-accent-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-accent-600 text-white"
                          : "bg-gray-100 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">
                        {config.label}
                      </p>
                      <ul className="mt-1.5 space-y-0.5">
                        {features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-accent-600">
                    {formatRupiah(config.price)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-border p-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!selectedTier || isPending}
            className="flex-1"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Beli Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
