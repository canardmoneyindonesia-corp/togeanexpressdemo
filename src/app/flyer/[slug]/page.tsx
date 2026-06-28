import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentBySlug } from "@/lib/queries";
import { qrDataUrl } from "@/lib/qr";
import { baseUrl } from "@/lib/url";
import { Flyer } from "@/components/flyer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  return {
    title: agent
      ? `Togean Express × ${agent.name} — Flyer`
      : "Flyer not found",
  };
}

export default async function FlyerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  // QR points at the agent's referral link so scans are credited to them.
  const qr = await qrDataUrl(`${await baseUrl()}/a/${agent.slug}`);

  // Plain wrapper so the export route can screenshot the `.flyer` element on a
  // clean background. `data-flyer-ready` lets the screenshot wait for layout.
  return (
    <main
      data-flyer-ready
      style={{
        background: "#cdd8de",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Flyer name={agent.name} slug={agent.slug} qrDataUrl={qr} />
    </main>
  );
}
