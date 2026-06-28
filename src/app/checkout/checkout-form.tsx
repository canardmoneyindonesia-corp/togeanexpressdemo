"use client";

import { useMemo, useState } from "react";
import { Loader2, Minus, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { formatIDR } from "@/lib/money";
import DatePicker from "./date-picker";
import CountrySelect from "./country-select";
import RouteSelect from "./route-select";
import LocationSelect from "./location-select";
import { dialForIso } from "@/lib/country-codes";

type TripOption = {
  id: string;
  name: string;
  route: string | null;
  price_idr: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutForm({
  trips,
  partnerSlug,
  partnerName,
  partnerValid,
  pickupOptions,
  dropoffOptions,
}: {
  trips: TripOption[];
  partnerSlug: string;
  partnerName: string;
  partnerValid: boolean;
  pickupOptions: string[];
  dropoffOptions: string[];
}) {
  const [step, setStep] = useState<1 | 2>(1);

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
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trip = useMemo(
    () => trips.find((t) => t.id === tripId) ?? trips[0],
    [trips, tripId]
  );
  const total = (trip?.price_idr ?? 0) * quantity;

  function goNext() {
    setError(null);
    if (!travelDate) {
      setError("Please pick a departure date.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter the guest's full name.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep(2);
  }

  function goBack() {
    setError(null);
    setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Please choose both pick-up and drop-off locations.");
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
          pickup,
          dropoff,
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

  const errorBox = error && (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
    </p>
  );

  const totalBox = (
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
  );

  return (
    <div className="space-y-4">
      <Stepper step={step} />

      {step === 1 ? (
        <div className="space-y-3.5">
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
              <DatePicker value={travelDate} onChange={setTravelDate} tripId={tripId} />
            </div>
          </div>

          <div>
            <label className={label}>Full name</label>
            <input
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

          {totalBox}

          {errorBox}

          <button
            type="button"
            onClick={goNext}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-accent-600"
          >
            Continue <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Pick-up location &amp; time</label>
              {pickupOptions.length > 0 ? (
                <LocationSelect
                  options={pickupOptions}
                  value={pickup}
                  onChange={setPickup}
                  placeholder="Select a pick-up point"
                  title="Choose pick-up point"
                />
              ) : (
                <input
                  className={field}
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Kadidiri Paradise jetty"
                />
              )}
            </div>
            <div>
              <label className={label}>Drop-off location &amp; time</label>
              {dropoffOptions.length > 0 ? (
                <LocationSelect
                  options={dropoffOptions}
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="Select a drop-off point"
                  title="Choose drop-off point"
                />
              ) : (
                <input
                  className={field}
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="e.g. Luwuk Airport"
                />
              )}
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

          {totalBox}

          {/* Terms & Conditions acceptance — required. */}
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

          {errorBox}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center justify-center gap-2 rounded-xl border border-ocean-200 bg-white px-5 py-3 font-bold text-ocean-800 transition hover:bg-ocean-100"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button
              type="submit"
              disabled={submitting || !agreed}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {submitting ? "Redirecting…" : "Pay with Xendit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Guest info" },
    { n: 2, label: "Pick-up & drop-off" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active || done
                  ? "bg-accent-500 text-white"
                  : "bg-ocean-100 text-ocean-500"
              }`}
            >
              {s.n}
            </span>
            <span
              className={`truncate text-xs font-semibold ${
                active ? "text-ocean-900" : "text-ocean-500"
              }`}
            >
              {s.label}
            </span>
            {i === 0 && (
              <span className="mx-1 h-px flex-1 bg-ocean-200" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
