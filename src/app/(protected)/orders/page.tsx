// ===========================================
// Orders Page — DataInsight Mini
// ===========================================

import { Suspense } from "react";
import { getUserOrders } from "@/features/payment/payment-service";
import { OrdersClient } from "./client";

export const metadata = {
  title: "Pesanan — DataInsight Mini",
  description: "Daftar pesanan laporan Anda.",
};

async function OrdersContent() {
  const { data: orders, error } = await getUserOrders();
  return <OrdersClient orders={orders} error={error} />;
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
