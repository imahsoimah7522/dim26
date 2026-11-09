"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChartIcon } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";

interface AnalyticsCategoryChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function AnalyticsCategoryChart({
  data,
  title = "Distribusi Kategori",
}: AnalyticsCategoryChartProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <PieChartIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Data kategori tidak tersedia
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatRupiah(Number(value)), "Pendapatan"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={10}
              formatter={(value: string) => (
                <span className="text-xs text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
