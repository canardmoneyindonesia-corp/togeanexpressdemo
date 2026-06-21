import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getCommissionSummary } from "@/lib/queries";
import { formatIDR, num } from "@/lib/money";
import { Receipt, Wallet, Clock, HandCoins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [stats] = (await sql`
    select
      count(*)::int as total_bookings,
      coalesce(sum(amount_idr) filter (where status = 'paid'), 0)::bigint as paid_revenue,
      count(*) filter (where status = 'pending')::int as pending,
      coalesce(sum(commission_idr) filter (where status = 'paid'), 0)::bigint as commission_owed
    from bookings
  `) as { total_bookings: number; paid_revenue: string; pending: number; commission_owed: string }[];

  const commission = await getCommissionSummary();

  const cards = [
    { label: "Total bookings", value: String(stats.total_bookings), icon: Receipt },
    { label: "Paid revenue", value: formatIDR(stats.paid_revenue), icon: Wallet },
    { label: "Pending", value: String(stats.pending), icon: Clock },
    { label: "Commission owed", value: formatIDR(stats.commission_owed), icon: HandCoins },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ocean-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-ocean-200 bg-white p-5"
          >
            <c.icon className="h-5 w-5 text-ocean-400" />
            <p className="mt-3 text-2xl font-bold text-ocean-900">{c.value}</p>
            <p className="text-sm text-ocean-500">{c.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ocean-900">
          Commission by partner (paid bookings)
        </h2>
        <div className="overflow-hidden rounded-2xl border border-ocean-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ocean-50 text-left text-ocean-600">
              <tr>
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium">Paid revenue</th>
                <th className="px-4 py-3 font-medium">Commission owed</th>
              </tr>
            </thead>
            <tbody>
              {commission.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ocean-400">
                    No partner bookings yet.
                  </td>
                </tr>
              )}
              {commission.map((c) => (
                <tr key={c.agent_slug} className="border-t border-ocean-100">
                  <td className="px-4 py-3 font-medium text-ocean-900">
                    {c.agent_slug}
                  </td>
                  <td className="px-4 py-3">{c.bookings}</td>
                  <td className="px-4 py-3">{formatIDR(num(c.paid_revenue))}</td>
                  <td className="px-4 py-3 font-semibold text-ocean-700">
                    {formatIDR(num(c.commission_owed))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
