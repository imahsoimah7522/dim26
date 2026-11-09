// ===========================================
// Order Detail Page — DataInsight Mini
// ===========================================

import { Suspense } from "react";
import { getOrderById } from "@/features/payment/payment-service";
import { OrderDetailClient } from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Detail Pesanan — DataInsight Mini",
};

async function OrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: order, error } = await getOrderById(id);

  if (error || !order) {
    redirect("/orders");
  }

  return <OrderDetailClient order={order} />;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      }
    >
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
