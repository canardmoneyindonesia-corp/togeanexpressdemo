import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getMonthAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

// GET /api/admin/departures?tripId=...&year=2026&month=6  -> full day detail
export async function GET(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = new URL(req.url).searchParams;
  const tripId = p.get("tripId") ?? "";
  const year = Number(p.get("year"));
  const month = Number(p.get("month")); // 1-12
  if (!tripId || !year || !month)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const days = await getMonthAvailability(tripId, year, month - 1);
  return NextResponse.json({ days });
}

// PATCH: upsert a per-date override. Body: { tripId, date, capacity|null, closed }
// capacity=null clears the override (falls back to the trip default).
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const tripId = String(body.tripId ?? "");
  const date = String(body.date ?? "");
  if (!tripId || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: "Missing tripId/date" }, { status: 400 });

  const closed = body.closed === true;
  const capacity =
    body.capacity === null || body.capacity === undefined || body.capacity === ""
      ? null
      : Math.max(0, Math.round(Number(body.capacity)));

  // If nothing overrides the default and it's open, drop the row to keep things clean.
  if (!closed && capacity === null) {
    await sql`delete from departures where trip_id = ${tripId} and date = ${date}`;
    return NextResponse.json({ ok: true, cleared: true });
  }

  await sql`
    insert into departures (trip_id, date, capacity, closed)
    values (${tripId}, ${date}, ${capacity}, ${closed})
    on conflict (trip_id, date)
    do update set capacity = excluded.capacity, closed = excluded.closed`;
  return NextResponse.json({ ok: true });
}
