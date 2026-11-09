// ===========================================
// DataInsight Mini — Pricing Card Component
// ===========================================
// Reusable pricing tier card.

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export function PricingCard({
  name,
  price,
  priceNote,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8",
        highlighted
          ? "border-accent-500 bg-white ring-1 ring-accent-500"
          : "border-border bg-white"
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-600 px-3 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-bold text-navy-900">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-navy-900">{price}</span>
        {priceNote && (
          <span className="ml-1 text-sm text-muted-foreground">
            {priceNote}
          </span>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span className="text-navy-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
          highlighted
            ? "bg-navy-800 text-white hover:bg-navy-700"
            : "border border-navy-200 bg-white text-navy-800 hover:bg-navy-50"
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
