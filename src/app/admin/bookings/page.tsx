import { requireAdmin } from "@/lib/auth";
import { getAllBookings } from "@/lib/queries";
import { formatIDR } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  expired: "bg-ocean-100 text-ocean-600",
  failed: "bg-red-100 text-red-700",
};

export default async function BookingsPage() {
  await requireAdmin();
  const bookings = await getAllBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ocean-900">Bookings</h1>

      <div className="overflow-x-auto rounded-2xl border border-ocean-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-ocean-50 text-left text-ocean-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Partner</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Commission</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ocean-400">
                  No bookings yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-ocean-100">
                <td className="whitespace-nowrap px-4 py-3 text-ocean-500">
                  {new Date(b.created_at).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ocean-900">
                    {b.customer_name ?? "—"}
                  </div>
                  <div className="text-xs text-ocean-400">
                    {b.customer_email}
                  </div>
                </td>
                <td className="px-4 py-3">{b.trip_name ?? "—"}</td>
                <td className="px-4 py-3">{b.quantity}</td>
                <td className="px-4 py-3">{b.agent_slug ?? "direct"}</td>
                <td className="px-4 py-3 font-medium">
                  {formatIDR(b.amount_idr)}
                </td>
                <td className="px-4 py-3 text-ocean-700">
                  {formatIDR(b.commission_idr)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[b.status] ?? "bg-ocean-100 text-ocean-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
