// ===========================================
// DataInsight Mini — Sales Line Chart
// ===========================================
// Recharts line chart for monthly sales trend.

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DemoSalesRecord } from "@/lib/demo/data";

interface SalesChartProps {
  data: DemoSalesRecord[];
}

function formatTooltipValue(value: number): string {
  return "Rp" + (value / 1_000_000).toFixed(1) + " jt";
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-navy-900">
        Tren Penjualan Bulanan
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="bulan"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v / 1_000_000).toFixed(0) + " jt"}
            />
            <Tooltip
              formatter={(value) => [formatTooltipValue(Number(value))]}
              labelStyle={{ color: "#0f1b33", fontWeight: 600 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="penjualan"
              name="Penjualan"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#2563eb" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
