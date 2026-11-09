"use client";

import type { KPIResult } from "@/features/analytics/analytics-types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface AnalyticsKPICardProps {
  kpi: KPIResult;
}

export function AnalyticsKPICard({ kpi }: AnalyticsKPICardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-white p-5 shadow-sm",
        !kpi.available && "opacity-60"
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>

      <p className="mt-1 text-2xl font-bold text-navy-900">
        {kpi.available ? kpi.formattedValue : "—"}
      </p>

      {!kpi.available && kpi.unavailableReason && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" />
          <span>{kpi.unavailableReason}</span>
        </p>
      )}
    </div>
  );
}
