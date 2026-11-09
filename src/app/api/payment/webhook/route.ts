// ===========================================
// Payment Webhook Route — DataInsight Mini
// ===========================================
// Menerima callback dari payment gateway.
// ⚠️ Endpoint ini TIDAK menggunakan auth session.
// Verifikasi dilakukan via webhook signature.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WebhookPayloadSchema } from "@/features/payment/payment-schemas";
import { createHmac } from "crypto";

export async function POST(request: Request) {
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 500 }
    );
  }

  // Baca body sebagai text untuk signature verification
  const body = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";

  // Verify signature
  const expected = createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 401 }
    );
  }

  // Parse dan validasi payload
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON." },
      { status: 400 }
    );
  }

  const parsed = WebhookPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload." },
      { status: 400 }
    );
  }

  const { orderId, status, transactionId, amount } = parsed.data;
  const admin = createAdminClient();

  // Cek order exists
  const { data: order } = await admin
    .from("report_orders")
    .select("id, payment_status, price")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 }
    );
  }

  // Cegah duplicate processing
  if (order.payment_status === "paid") {
    return NextResponse.json({ message: "Already processed." });
  }

  // Validasi amount jika disediakan
  if (amount !== undefined && amount !== order.price) {
    // Log mismatch tapi tetap process
    await admin.from("payment_events").insert({
      order_id: orderId,
      event_type: "webhook",
      payload: {
        warning: "Amount mismatch",
        expected: order.price,
        received: amount,
        status,
        transactionId,
      },
    });
  }

  // Map status
  const mappedStatus = status === "expired" ? "failed" : status;

  // Update order status
  const { error: updateError } = await admin
    .from("report_orders")
    .update({
      payment_status: mappedStatus,
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
    event_type: "webhook",
    payload: { status: mappedStatus, transactionId, amount },
  });

  return NextResponse.json({ message: "OK", status: mappedStatus });
}
