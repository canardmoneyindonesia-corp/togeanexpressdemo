import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPartner } from "@/lib/partners";
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
  const partner = getPartner(slug);
  return {
    title: partner
      ? `Togean Express × ${partner.name} — Flyer`
      : "Flyer not found",
  };
}

export default async function FlyerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = getPartner(slug);
  if (!partner) notFound();

  const qr = await qrDataUrl(`${await baseUrl()}${partner.bookingPath}`);

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
      <Flyer partner={partner} qrDataUrl={qr} />
    </main>
  );
}
