// ===========================================
// DataInsight Mini — KPI Card Component
// ===========================================
// Reusable KPI card for dashboard & demo pages.

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
}

export function KPICard({ label, value, change, changeLabel }: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-navy-900">{value}</p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-danger" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              isPositive ? "text-success" : "text-danger"
            )}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
