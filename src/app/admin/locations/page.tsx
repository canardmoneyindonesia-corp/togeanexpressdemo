import { requireAdmin } from "@/lib/auth";
import { getAllLocations } from "@/lib/queries";
import LocationsManager from "./locations-manager";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  await requireAdmin();
  const locations = await getAllLocations();
  return (
    <LocationsManager
      locations={locations.map((l) => ({
        id: l.id,
        kind: l.kind,
        area: l.area,
        place: l.place,
        time_label: l.time_label,
        sort_order: Number(l.sort_order),
        active: l.active,
      }))}
    />
  );
}
