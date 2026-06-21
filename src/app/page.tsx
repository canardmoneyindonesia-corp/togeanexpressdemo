import Link from "next/link";
import {
  Ship,
  Ticket,
  ShieldCheck,
  Clock,
  Wifi,
  Armchair,
  MessagesSquare,
  ArrowRight,
} from "lucide-react";

const amenities = [
  { icon: Wifi, label: "Free Starlink internet" },
  { icon: Armchair, label: "Cushioned chairs" },
  { icon: MessagesSquare, label: "English-proficient crew" },
  { icon: Clock, label: "Real-time WhatsApp updates" },
];

const compare = [
  { metric: "Duration", express: "5.5–6.5 hrs", public: "23–25 hrs" },
  { metric: "Departures", express: "Guaranteed daily", public: "Often changed" },
  { metric: "Pricing", express: "1.5M IDR", public: "1.3M IDR + hotel" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-900 text-white shadow-lg">
          <Ship className="h-8 w-8" />
        </div>
        <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-ocean-900 sm:text-6xl">
          Togean
          <br />
          <span className="text-ocean-500">Express</span>
        </h1>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ocean-700">
          Luwuk Airport to &amp; from the Togean Islands
        </p>
        <p className="mt-3 text-lg font-bold italic text-accent-500">
          Fast · Convenient · Affordable
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 font-bold text-white shadow-md transition hover:bg-accent-600"
          >
            <Ticket className="h-5 w-5" /> Book a transfer
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ocean-200 bg-white px-7 py-3.5 font-bold text-ocean-800 transition hover:bg-ocean-100"
          >
            <ShieldCheck className="h-5 w-5" /> Admin panel
          </Link>
        </div>
      </section>

      {/* Comparison */}
      <section className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-ocean-200 bg-white shadow-sm">
          <div className="grid grid-cols-3 bg-ocean-900 text-center text-xs font-bold uppercase tracking-wide text-white">
            <div className="px-3 py-3 text-ocean-200">Compare</div>
            <div className="bg-ocean-500/20 px-3 py-3">Togean Express</div>
            <div className="px-3 py-3 text-ocean-300">Public Speedboat</div>
          </div>
          {compare.map((row, i) => (
            <div
              key={row.metric}
              className={`grid grid-cols-3 items-center text-center text-sm ${
                i % 2 ? "bg-ocean-50" : "bg-white"
              }`}
            >
              <div className="px-3 py-3 font-semibold text-ocean-700">
                {row.metric}
              </div>
              <div className="px-3 py-3 font-bold text-accent-500">
                {row.express}
              </div>
              <div className="px-3 py-3 text-ocean-500">{row.public}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="mt-10">
        <h2 className="text-center text-xl font-extrabold text-ocean-900">
          On every transfer
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {amenities.map((a) => (
            <div
              key={a.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-ocean-100 bg-white px-3 py-5 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ocean-500 text-white">
                <a.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-ocean-700">
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mt-12 rounded-2xl bg-ocean-900 px-6 py-8 text-center text-white">
        <h2 className="text-2xl font-extrabold text-white">
          Ready to skip the overnight?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ocean-200">
          Same-day arrivals synced with Makassar flights. Reserve your seat in
          under a minute.
        </p>
        <Link
          href="/checkout"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 font-bold text-white transition hover:bg-accent-600"
        >
          Scan to Book <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <p className="mt-10 text-center text-xs text-ocean-400">
        Travel agents: scan your QR code or open your personal link to book on
        behalf of guests.
      </p>
    </main>
  );
}
