import { NextRequest, NextResponse } from "next/server";
import { getMonthAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

// Public: seats left per operating day for a trip in a given month.
// GET /api/availability?tripId=...&year=2026&month=6   (month is 1-12)
export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams;
  const tripId = p.get("tripId") ?? "";
  const year = Number(p.get("year"));
  const month = Number(p.get("month")); // 1-12
  if (!tripId || !year || !month) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const days = await getMonthAvailability(tripId, year, month - 1);
  // Only expose what the picker needs.
  const data = days.map((d) => ({
    date: d.date,
    seatsLeft: d.seatsLeft,
    closed: d.closed,
    soldOut: !d.closed && d.seatsLeft <= 0,
  }));
  return NextResponse.json({ days: data });
}
