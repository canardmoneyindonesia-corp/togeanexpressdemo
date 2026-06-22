"use client";

import { useMemo, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { formatIDR } from "@/lib/money";
import DatePicker from "./date-picker";
import CountrySelect from "./country-select";
import RouteSelect from "./route-select";
import { dialForIso } from "@/lib/country-codes";

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
  // Editable string buffer so the field can be cleared/retyped on mobile;
  // `quantity` is the clamped numeric value used for pricing & submission.
  const [qtyText, setQtyText] = useState("1");
  const quantity = Math.min(50, Math.max(1, parseInt(qtyText, 10) || 1));
  const setQty = (n: number) =>
    setQtyText(String(Math.min(50, Math.max(1, n))));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryIso, setCountryIso] = useState("ID");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [agreed, setAgreed] = useState(false);
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
    if (!travelDate) {
      setError("Please pick a departure date.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
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
          customerPhone: phone ? `${dialForIso(countryIso)} ${phone}`.trim() : "",
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

  const fieldBase =
    "rounded-lg border border-ocean-200 bg-white px-3 py-2 text-ocean-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30";
  const field = `w-full ${fieldBase}`;
  const label = "mb-1 block text-xs font-semibold text-ocean-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div>
        <label className={label}>Route</label>
        <RouteSelect trips={trips} value={tripId} onChange={setTripId} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Passengers</label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-ocean-200 bg-white transition focus-within:border-ocean-500 focus-within:ring-2 focus-within:ring-ocean-500/30">
            <button
              type="button"
              aria-label="Remove passenger"
              onClick={() => setQty(quantity - 1)}
              disabled={quantity <= 1}
              className="flex w-11 shrink-0 items-center justify-center text-ocean-600 transition hover:bg-ocean-50 active:bg-ocean-100 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Number of passengers"
              className="w-full min-w-0 flex-1 border-x border-ocean-200 py-2 text-center text-ocean-900 outline-none"
              value={qtyText}
              onChange={(e) =>
                setQtyText(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))
              }
              onBlur={() => setQtyText(String(quantity))}
            />
            <button
              type="button"
              aria-label="Add passenger"
              onClick={() => setQty(quantity + 1)}
              disabled={quantity >= 50}
              className="flex w-11 shrink-0 items-center justify-center text-ocean-600 transition hover:bg-ocean-50 active:bg-ocean-100 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <label className={label}>Travel date</label>
          <DatePicker value={travelDate} onChange={setTravelDate} />
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div className="flex gap-2">
            <CountrySelect value={countryIso} onChange={setCountryIso} />
            <input
              className={`${fieldBase} min-w-0 flex-1`}
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="812 3456 789"
            />
          </div>
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

      <div className="rounded-xl border border-accent-100 bg-accent-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-ocean-600">
          <span>
            {formatIDR(trip?.price_idr ?? 0)} × {quantity}{" "}
            {quantity > 1 ? "passengers" : "passenger"}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold text-ocean-800">Total</span>
          <span className="text-2xl font-black text-accent-500">
            {formatIDR(total)}
          </span>
        </div>
      </div>

      {/* Terms & Conditions acceptance — required, responsive. */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ocean-200 bg-white px-4 py-3 text-sm text-ocean-700 transition hover:border-ocean-300 has-[:checked]:border-ocean-500 has-[:checked]:bg-ocean-50">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-accent-500"
        />
        <span className="leading-snug">
          I have read and agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ocean-700 underline underline-offset-2 hover:text-accent-500"
          >
            Terms &amp; Conditions
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !agreed}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
        {submitting ? "Redirecting to payment…" : "Pay with Xendit"}
      </button>
    </form>
  );
}
