// ===========================================
// Order Detail Page — DataInsight Mini
// ===========================================

import { connection } from "next/server";
import { getOrderById } from "@/features/payment/payment-service";
import { OrderDetailClient } from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Detail Pesanan — DataInsight Mini",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const { data: order, error } = await getOrderById(id);

  if (error || !order) {
    redirect("/orders");
  }

  return <OrderDetailClient order={order} />;
}
