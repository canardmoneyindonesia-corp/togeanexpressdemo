import { requireAdmin } from "@/lib/auth";
import { getAllAgents } from "@/lib/queries";
import { qrDataUrl } from "@/lib/qr";
import { baseUrl } from "@/lib/url";
import { num } from "@/lib/money";
import AgentsManager from "./agents-manager";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  await requireAdmin();

  const base = await baseUrl();
  const agents = await getAllAgents();

  const enriched = await Promise.all(
    agents.map(async (a) => {
      const link = `${base}/a/${a.slug}`;
      return {
        id: a.id,
        slug: a.slug,
        name: a.name,
        email: a.email,
        phone: a.phone,
        commission_pct: num(a.commission_pct),
        active: a.active,
        link,
        qr: await qrDataUrl(link),
      };
    })
  );

  return <AgentsManager agents={enriched} />;
}
