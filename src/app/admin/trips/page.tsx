import { requireAdmin } from "@/lib/auth";
import { getAllTrips } from "@/lib/queries";
import { num } from "@/lib/money";
import TripsManager from "./trips-manager";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  await requireAdmin();
  const trips = await getAllTrips();
  return (
    <TripsManager
      trips={trips.map((t) => ({
        id: t.id,
        name: t.name,
        route: t.route,
        description: t.description,
        price_idr: num(t.price_idr),
        capacity: num(t.capacity),
        active: t.active,
      }))}
    />
  );
}
