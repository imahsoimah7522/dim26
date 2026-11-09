// ===========================================
// Order Status Badge — DataInsight Mini
// ===========================================

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/features/payment";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Menunggu Pembayaran", variant: "outline" },
  paid: { label: "Lunas", variant: "default" },
  failed: { label: "Gagal", variant: "destructive" },
  refunded: { label: "Dikembalikan", variant: "secondary" },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
