import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { getBooking } from "@/lib/queries";
import { formatIDR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: redirectStatus } = await searchParams;
  const booking = await getBooking(id);

  if (!booking) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-xl font-semibold text-ocean-900">
          Booking not found
        </h1>
        <Link href="/checkout" className="mt-4 inline-block text-ocean-600">
          ← Back to booking
        </Link>
      </main>
    );
  }

  // The webhook is the source of truth; the redirect param is just a hint.
  const paid = booking.status === "paid";
  const failed = booking.status === "failed" || redirectStatus === "failed";

  const state = paid
    ? {
        icon: <CheckCircle2 className="h-14 w-14 text-emerald-500" />,
        title: "Payment confirmed",
        sub: "Your speedboat seats are booked. See you on board!",
      }
    : failed
      ? {
          icon: <XCircle className="h-14 w-14 text-red-500" />,
          title: "Payment not completed",
          sub: "Your booking was not paid. You can try again.",
        }
      : {
          icon: <Clock className="h-14 w-14 text-amber-500" />,
          title: "Awaiting payment confirmation",
          sub: "We're confirming your payment with Xendit. This page updates once confirmed.",
        };

  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mb-4 flex justify-center">{state.icon}</div>
      <h1 className="text-2xl font-bold text-ocean-900">{state.title}</h1>
      <p className="mt-2 text-ocean-700">{state.sub}</p>

      <div className="mt-8 rounded-2xl border border-ocean-200 bg-white p-5 text-left text-sm">
        <Row label="Booking ID" value={booking.id.slice(0, 8)} />
        <Row label="Route" value={booking.trip_name ?? "—"} />
        <Row label="Passengers" value={String(booking.quantity)} />
        {booking.travel_date && (
          <Row label="Travel date" value={booking.travel_date} />
        )}
        <Row label="Total" value={formatIDR(booking.amount_idr)} />
        <Row
          label="Status"
          value={booking.status.toUpperCase()}
        />
      </div>

      {!paid && booking.xendit_invoice_url && (
        <a
          href={booking.xendit_invoice_url}
          className="mt-6 inline-block rounded-xl bg-accent-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-accent-600"
        >
          {failed ? "Retry payment" : "Open payment page"}
        </a>
      )}

      <div className="mt-6">
        <Link href="/checkout" className="text-sm text-ocean-600">
          ← New booking
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ocean-100 py-2 last:border-0">
      <span className="text-ocean-500">{label}</span>
      <span className="font-medium text-ocean-900">{value}</span>
    </div>
  );
}
