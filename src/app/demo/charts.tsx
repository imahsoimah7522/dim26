// ===========================================
// DataInsight Mini — Demo Charts (Client)
// ===========================================
// Client component wrapper for Recharts on the demo page.

"use client";

import { SalesChart } from "@/components/dashboard/sales-chart";
import { ProductChart } from "@/components/dashboard/product-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import type {
  DemoSalesRecord,
  DemoProductRecord,
  DemoCategoryRecord,
} from "@/lib/demo/data";

interface DemoChartsProps {
  salesData: DemoSalesRecord[];
  productData: DemoProductRecord[];
  categoryData: DemoCategoryRecord[];
}

export function DemoCharts({
  salesData,
  productData,
  categoryData,
}: DemoChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <SalesChart data={salesData} />
      </div>
      <ProductChart data={productData} />
      <CategoryChart data={categoryData} />
    </div>
  );
}
