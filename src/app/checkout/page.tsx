import { Ship, ShieldCheck, Clock, Users } from "lucide-react";
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
    <main className="flex min-h-screen flex-col bg-white">
      {/* Navy header echoing the flyer lockup — full bleed */}
      <div className="bg-ocean-900 px-5 py-5 text-white sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase leading-none tracking-tight text-white">
                Togean <span className="text-ocean-400">Express</span>
              </h1>
              <p className="mt-1 text-sm text-ocean-200">
                Luwuk Airport ⇄ Togean Islands
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-ocean-200">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 5.5–6.5 hrs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Mon · Wed · Sat
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Guaranteed departures
            </span>
          </div>
        </div>
      </div>

      {/* Form area fills the rest of the screen */}
      <div className="flex-1 px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          {agent && (
            <div className="mb-4 rounded-xl border border-ocean-200 bg-ocean-50 px-4 py-2.5 text-sm text-ocean-800">
              Booking via partner:{" "}
              <span className="font-semibold">{agent.name}</span>
            </div>
          )}

          {trips.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No trips are available yet. (Admin: add trips in the admin panel
              and run <code>npm run db:init</code> if you haven&apos;t seeded
              the database.)
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
        </div>
      </div>

      {/* Trust footer pinned to the bottom */}
      <p className="flex items-center justify-center gap-1.5 px-4 py-4 text-center text-xs text-ocean-500">
        <ShieldCheck className="h-4 w-4 text-ocean-400" />
        Secure payment powered by Xendit
      </p>
    </main>
  );
}
