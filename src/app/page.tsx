import Link from "next/link";
import { Ship, Ticket, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-600 text-white shadow-lg">
        <Ship className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-ocean-900">
        Togean Express
      </h1>
      <p className="mt-3 max-w-md text-ocean-700">
        Fast, reliable speedboat transfers across the Togean Islands. Book your
        seat in under a minute.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-ocean-700"
        >
          <Ticket className="h-5 w-5" /> Book a transfer
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-ocean-200 bg-white px-6 py-3 font-semibold text-ocean-700 transition hover:bg-ocean-100"
        >
          <ShieldCheck className="h-5 w-5" /> Admin panel
        </Link>
      </div>

      <p className="mt-12 text-xs text-ocean-400">
        Travel agents: scan your QR code or open your personal link to book on
        behalf of guests.
      </p>
    </main>
  );
}
