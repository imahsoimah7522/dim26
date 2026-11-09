// ===========================================
// Orders Client Component — DataInsight Mini
// ===========================================

"use client";

import Link from "next/link";
import {
  FileText,
  Calendar,
  AlertCircle,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/payment/order-status-badge";
import {
  PAYMENT_TIERS,
  formatRupiah,
  type OrderDetail,
} from "@/features/payment";

interface OrdersClientProps {
  orders: OrderDetail[];
  error: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersClient({ orders, error }: OrdersClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Pesanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Riwayat pembelian laporan Anda
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/upload">
            <CreditCard className="mr-2 h-4 w-4" />
            Analisis Baru
          </Link>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty */}
      {orders.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white p-12 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-navy-900">
            Belum ada pesanan
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload dan analisis data, lalu beli laporan premium untuk hasil
            tanpa watermark.
          </p>
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50">
                  <FileText className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-navy-900">
                      {PAYMENT_TIERS[order.tier].label}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.fileName}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.createdAt)}
                    {order.paymentReference && (
                      <span className="font-mono text-accent-600">
                        {order.paymentReference}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm font-bold text-navy-900">
                {formatRupiah(order.price)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
