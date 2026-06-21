"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/money";

type TripOption = {
  id: string;
  name: string;
  route: string | null;
  price_idr: number;
};

export default function CheckoutForm({
  trips,
  partnerSlug,
  partnerName,
  partnerValid,
}: {
  trips: TripOption[];
  partnerSlug: string;
  partnerName: string;
  partnerValid: boolean;
}) {
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trip = useMemo(
    () => trips.find((t) => t.id === tripId) ?? trips[0],
    [trips, tripId]
  );
  const total = (trip?.price_idr ?? 0) * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          quantity,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          travelDate,
          partner: partnerSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      // Redirect to the Xendit hosted invoice page.
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const field =
    "w-full rounded-lg border border-ocean-200 bg-white px-3 py-2.5 text-ocean-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200";
  const label = "mb-1 block text-sm font-medium text-ocean-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={label}>Route</label>
        <select
          className={field}
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
        >
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {formatIDR(t.price_idr)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Passengers</label>
          <input
            type="number"
            min={1}
            max={50}
            className={field}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Number(e.target.value) || 1))
            }
          />
        </div>
        <div>
          <label className={label}>Travel date</label>
          <input
            type="date"
            required
            className={field}
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={label}>Full name</label>
        <input
          required
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            required
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="guest@email.com"
          />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input
            className={field}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62…"
          />
        </div>
      </div>

      {/* Partner field — autofilled from the agent link/QR, read-only. */}
      <div>
        <label className={label}>Partner / Agent</label>
        <input
          className={`${field} bg-ocean-50 text-ocean-700`}
          value={partnerName || partnerSlug || "Direct booking"}
          readOnly
        />
        {partnerSlug && !partnerValid && (
          <p className="mt-1 text-xs text-amber-600">
            Partner code “{partnerSlug}” not recognised — booking will be
            recorded as direct.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-accent-100 bg-accent-50 px-4 py-3">
        <span className="font-semibold text-ocean-800">Total</span>
        <span className="text-2xl font-black text-accent-500">
          {formatIDR(total)}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-accent-600 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
        {submitting ? "Redirecting to payment…" : "Pay with Xendit"}
      </button>
    </form>
  );
}
