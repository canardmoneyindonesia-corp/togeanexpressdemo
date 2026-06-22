import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { getTrip, getAgentBySlug } from "@/lib/queries";
import { getDateAvailability } from "@/lib/availability";
import { createInvoice } from "@/lib/xendit";
import { baseUrl } from "@/lib/url";
import { num } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tripId,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      pickup,
      dropoff,
      travelDate,
      partner,
    } = body ?? {};

    const trip = await getTrip(String(tripId ?? ""));
    if (!trip) {
      return NextResponse.json({ error: "Invalid trip" }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(50, Number(quantity) || 1));
    const unitPrice = num(trip.price_idr);
    const amount = unitPrice * qty;

    // Capacity / availability enforcement.
    const date = String(travelDate ?? "");
    if (!date) {
      return NextResponse.json(
        { error: "Please choose a departure date." },
        { status: 400 }
      );
    }
    const avail = await getDateAvailability(trip.id, date);
    if (!avail.operating) {
      return NextResponse.json(
        { error: "No departure runs on that date." },
        { status: 409 }
      );
    }
    if (avail.closed) {
      return NextResponse.json(
        { error: "That departure is closed. Please pick another date." },
        { status: 409 }
      );
    }
    if (qty > avail.seatsLeft) {
      return NextResponse.json(
        {
          error:
            avail.seatsLeft <= 0
              ? "That departure is fully booked. Please pick another date."
              : `Only ${avail.seatsLeft} seat${avail.seatsLeft === 1 ? "" : "s"} left on that departure.`,
        },
        { status: 409 }
      );
    }

    // Resolve partner/agent + commission.
    const agent = partner ? await getAgentBySlug(String(partner)) : null;
    const commissionPct = agent ? num(agent.commission_pct) : 0;
    const commission = Math.round((amount * commissionPct) / 100);

    const bookingId = randomUUID();
    const base = await baseUrl();

    // Create the booking as pending first.
    await sql`
      insert into bookings (
        id, trip_id, trip_name, agent_slug, agent_id,
        customer_name, customer_email, customer_phone, pickup, dropoff, travel_date,
        quantity, unit_price_idr, amount_idr, commission_pct, commission_idr,
        status
      ) values (
        ${bookingId}, ${trip.id}, ${trip.name}, ${agent?.slug ?? null}, ${agent?.id ?? null},
        ${customerName ?? null}, ${customerEmail ?? null}, ${customerPhone ?? null},
        ${pickup || null}, ${dropoff || null},
        ${travelDate || null},
        ${qty}, ${unitPrice}, ${amount}, ${commissionPct}, ${commission},
        'pending'
      )`;

    // Create the Xendit invoice.
    const invoice = await createInvoice({
      externalId: bookingId,
      amount,
      description: `Togean Express — ${trip.name} x${qty}`,
      payerEmail: customerEmail || undefined,
      customerName: customerName || undefined,
      successRedirectUrl: `${base}/booking/${bookingId}?status=success`,
      failureRedirectUrl: `${base}/booking/${bookingId}?status=failed`,
    });

    await sql`
      update bookings
      set xendit_invoice_id = ${invoice.id}, xendit_invoice_url = ${invoice.invoice_url}
      where id = ${bookingId}`;

    return NextResponse.json({
      bookingId,
      invoiceUrl: invoice.invoice_url,
    });
  } catch (err) {
    console.error("[checkout] error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
