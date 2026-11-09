// ===========================================
// DataInsight Mini — Category Pie Chart
// ===========================================
// Recharts pie chart for revenue by category.

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { DemoCategoryRecord } from "@/lib/demo/data";

interface CategoryChartProps {
  data: DemoCategoryRecord[];
}

const COLORS = ["#2563eb", "#1e2d52", "#60a5fa", "#93c5fd"];

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-navy-900">
        Pendapatan per Kategori
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="pendapatan"
              nameKey="kategori"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              label={(props: PieLabelRenderProps) =>
                `${String(props.name ?? "")} ${((Number(props.percent) || 0) * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: "#94a3b8" }}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                "Rp" + (Number(value) / 1_000_000).toFixed(1) + " jt",
                "Pendapatan",
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
