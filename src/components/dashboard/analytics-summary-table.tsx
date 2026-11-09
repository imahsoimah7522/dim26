"use client";

import type { RankedItem } from "@/features/analytics/analytics-types";
import { formatRupiah, formatPercentage } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Table } from "lucide-react";

interface AnalyticsSummaryTableProps {
  items: RankedItem[];
  title: string;
  showQuantity?: boolean;
}

export function AnalyticsSummaryTable({
  items,
  title,
  showQuantity = false,
}: AnalyticsSummaryTableProps) {
  const displayItems = items.slice(0, 10);

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Table className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      </div>

      {displayItems.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Tidak ada data untuk ditampilkan
        </div>
      ) : (
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-2 py-2 font-medium text-muted-foreground">#</th>
                <th className="px-2 py-2 font-medium text-muted-foreground">
                  Nama
                </th>
                <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                  Pendapatan
                </th>
                {showQuantity && (
                  <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                    Qty
                  </th>
                )}
                <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, index) => (
                <tr
                  key={item.name}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-gray-50",
                    index === 0 && "font-medium"
                  )}
                >
                  <td className="px-2 py-2 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="max-w-[200px] truncate px-2 py-2 text-navy-900">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-navy-900">
                    {formatRupiah(item.revenue)}
                  </td>
                  {showQuantity && (
                    <td className="px-2 py-2 text-right text-navy-900">
                      {item.quantity.toLocaleString("id-ID")}
                    </td>
                  )}
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {formatPercentage(item.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
