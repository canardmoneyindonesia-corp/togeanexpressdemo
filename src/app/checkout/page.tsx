import Link from "next/link";
import { Ship } from "lucide-react";
import { getActiveTrips, getAgentBySlug } from "@/lib/queries";
import CheckoutForm from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  const { partner } = await searchParams;
  const trips = await getActiveTrips();
  const agent = partner ? await getAgentBySlug(partner) : null;

  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-600 text-white">
          <Ship className="h-6 w-6" />
        </div>
        <div>
          <Link href="/" className="text-lg font-bold text-ocean-900">
            Togean Express
          </Link>
          <p className="text-sm text-ocean-600">Speedboat transfer booking</p>
        </div>
      </header>

      {agent && (
        <div className="mb-5 rounded-xl border border-ocean-200 bg-ocean-100/70 px-4 py-3 text-sm text-ocean-800">
          Booking via partner:{" "}
          <span className="font-semibold">{agent.name}</span>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No trips are available yet. (Admin: add trips in the admin panel and
          run <code>npm run db:init</code> if you haven&apos;t seeded the
          database.)
        </div>
      ) : (
        <CheckoutForm
          trips={trips.map((t) => ({
            id: t.id,
            name: t.name,
            route: t.route,
            price_idr: Number(t.price_idr),
          }))}
          partnerSlug={agent?.slug ?? partner ?? ""}
          partnerName={agent?.name ?? ""}
          partnerValid={!!agent}
        />
      )}
    </main>
  );
}
