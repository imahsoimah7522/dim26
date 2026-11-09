// ===========================================
// Orders Page — DataInsight Mini
// ===========================================

import { connection } from "next/server";
import { getUserOrders } from "@/features/payment/payment-service";
import { OrdersClient } from "./client";

export const metadata = {
  title: "Pesanan — DataInsight Mini",
  description: "Daftar pesanan laporan Anda.",
};

export default async function OrdersPage() {
  await connection();
  const { data: orders, error } = await getUserOrders();

  return <OrdersClient orders={orders} error={error} />;
}
