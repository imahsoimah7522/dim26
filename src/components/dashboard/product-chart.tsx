// ===========================================
// DataInsight Mini — Product Bar Chart
// ===========================================
// Recharts bar chart for top products.

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
import type { DemoProductRecord } from "@/lib/demo/data";

interface ProductChartProps {
  data: DemoProductRecord[];
}

export function ProductChart({ data }: ProductChartProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-navy-900">
        Produk Terlaris
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toLocaleString("id-ID")}
            />
            <YAxis
              dataKey="produk"
              type="category"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString("id-ID") + " unit",
                "Jumlah",
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Bar
              dataKey="jumlah"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
