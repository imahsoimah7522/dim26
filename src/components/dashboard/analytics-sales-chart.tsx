"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";

interface AnalyticsSalesChartProps {
  data: { label: string; revenue: number; quantity: number }[];
  title?: string;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  }
  return value.toLocaleString("id-ID");
}

export function AnalyticsSalesChart({
  data,
  title = "Tren Penjualan",
}: AnalyticsSalesChartProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Data tren tidak tersedia
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="revenue"
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="quantity"
              orientation="right"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => {
                const numValue = Number(value);
                if (name === "revenue") return [formatRupiah(numValue), "Pendapatan"];
                return [numValue.toLocaleString("id-ID"), "Kuantitas"];
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2563eb" }}
              activeDot={{ r: 5 }}
              name="revenue"
            />
            <Line
              yAxisId="quantity"
              type="monotone"
              dataKey="quantity"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
              name="quantity"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
