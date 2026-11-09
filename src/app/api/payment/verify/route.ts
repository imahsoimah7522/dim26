// ===========================================
// Payment Verify Route — DataInsight Mini
// ===========================================
// Admin-only endpoint untuk verifikasi pembayaran manual.
// ⚠️ Dilindungi oleh PAYMENT_SECRET_KEY.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VerifyPaymentSchema } from "@/features/payment/payment-schemas";

export async function POST(request: Request) {
  const secretKey = process.env.PAYMENT_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Verification not configured." },
      { status: 500 }
    );
  }

  // Validasi admin secret
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  if (token !== secretKey) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON." },
      { status: 400 }
    );
  }

  const parsed = VerifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload." },
      { status: 400 }
    );
  }

  const { orderId, notes } = parsed.data;
  const admin = createAdminClient();

  // Cek order exists
  const { data: order } = await admin
    .from("report_orders")
    .select("id, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 }
    );
  }

  // Cegah duplicate
  if (order.payment_status === "paid") {
    return NextResponse.json({ message: "Already verified.", status: "paid" });
  }

  // Update status → paid
  const { error: updateError } = await admin
    .from("report_orders")
    .update({
      payment_status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }

  // Log payment event
  await admin.from("payment_events").insert({
    order_id: orderId,
    event_type: "verified",
    payload: {
      verified_at: new Date().toISOString(),
      notes: notes ?? null,
      method: "manual",
    },
  });

  return NextResponse.json({ message: "Payment verified.", status: "paid" });
}
