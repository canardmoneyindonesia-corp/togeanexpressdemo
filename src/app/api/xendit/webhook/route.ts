import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

// Xendit Invoice webhook.
// Configure the callback URL in Xendit dashboard → Settings → Webhooks (Invoices):
//   https://<your-domain>/api/xendit/webhook
// Xendit sends the verification token in the `x-callback-token` header.
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (expected && token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  // external_id is the booking id we set when creating the invoice.
  const externalId = String(payload.external_id ?? "");
  const xenditStatus = String(payload.status ?? "").toUpperCase();
  if (!externalId) {
    return NextResponse.json({ error: "Missing external_id" }, { status: 400 });
  }

  // Map Xendit invoice statuses to our booking statuses.
  let status: "paid" | "expired" | "failed" | null = null;
  if (xenditStatus === "PAID" || xenditStatus === "SETTLED") status = "paid";
  else if (xenditStatus === "EXPIRED") status = "expired";
  else if (xenditStatus === "FAILED") status = "failed";

  if (status) {
    await sql`
      update bookings
      set status = ${status},
          paid_at = ${status === "paid" ? new Date().toISOString() : null}
      where id = ${externalId}`;
  }

  return NextResponse.json({ received: true });
}
