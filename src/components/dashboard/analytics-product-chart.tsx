"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";

interface AnalyticsProductChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

function truncateName(name: string, maxLength = 18): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 1) + "…";
}

export function AnalyticsProductChart({
  data,
  title = "Produk Teratas",
}: AnalyticsProductChartProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Data produk tidak tersedia
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40 + 40)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatRupiah(v)}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tickFormatter={(name: string) => truncateName(name)}
              tick={{ fontSize: 12, fill: "#374151" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [formatRupiah(Number(value)), "Pendapatan"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
            <Bar
              dataKey="value"
              fill="#2563eb"
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
