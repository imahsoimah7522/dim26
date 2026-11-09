// ===========================================
// DataInsight Mini — Insight Card Component
// ===========================================
// Displays a single AI-generated business insight.

import { Lightbulb } from "lucide-react";

interface InsightCardProps {
  insight: string;
  index: number;
}

export function InsightCard({ insight, index }: InsightCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
        <Lightbulb className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Insight #{index + 1}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-navy-800">{insight}</p>
      </div>
    </div>
  );
}
