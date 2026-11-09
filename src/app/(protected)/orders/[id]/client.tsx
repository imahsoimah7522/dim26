// ===========================================
// Order Detail Client Component — DataInsight Mini
// ===========================================

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/payment/order-status-badge";
import {
  PAYMENT_TIERS,
  formatRupiah,
  type OrderDetail,
} from "@/features/payment";

interface OrderDetailClientProps {
  order: OrderDetail;
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

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const tierConfig = PAYMENT_TIERS[order.tier];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild size="sm">
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Pesanan
        </Link>
      </Button>

      {/* Order card */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-navy-900">
                {tierConfig.label}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            {order.paymentReference && (
              <p className="mt-1 font-mono text-sm text-accent-600">
                {order.paymentReference}
              </p>
            )}
          </div>
          <p className="text-2xl font-bold text-navy-900">
            {formatRupiah(order.price)}
          </p>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">File:</span>
            <span className="font-medium text-navy-900">{order.fileName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tanggal:</span>
            <span className="font-medium text-navy-900">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Status-specific content */}
        <div className="mt-6 border-t border-border pt-6">
          {order.status === "pending" && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Menunggu Pembayaran
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Silakan transfer sesuai instruksi pembayaran. Konfirmasi
                  pembayaran akan dilakukan dalam 1x24 jam kerja setelah
                  transfer diterima.
                </p>
              </div>
            </div>
          )}

          {order.status === "paid" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Pembayaran Dikonfirmasi
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    Laporan premium Anda siap didownload. Anda dapat mengunduh
                    laporan tanpa watermark dari halaman analisis.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/upload">
                  <Download className="mr-2 h-4 w-4" />
                  Download Laporan Premium
                </Link>
              </Button>
            </div>
          )}

          {order.status === "failed" && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Pembayaran Gagal
                </p>
                <p className="mt-1 text-xs text-red-700">
                  Pembayaran tidak berhasil atau telah kedaluwarsa. Silakan buat
                  pesanan baru jika ingin melanjutkan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
