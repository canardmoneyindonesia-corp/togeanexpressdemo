import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getMonthAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseISO(s: string): Date | null {
  if (!DATE_RE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

async function requireAuth() {
  return isAdmin();
}

// GET /api/admin/departures?tripId=...&year=2026&month=6 -> scheduled departures + bookings
export async function GET(req: NextRequest) {
  if (!(await requireAuth()))
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

// POST: add one departure or bulk-add a range.
//  { action: "add",     tripId, date, capacity }
//  { action: "bulkAdd", tripId, from, to, weekdays:[0..6], capacity }
export async function POST(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const tripId = String(body.tripId ?? "");
  if (!tripId)
    return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
  const capacity = Math.max(0, Math.round(Number(body.capacity) || 0));

  if (body.action === "add") {
    const date = String(body.date ?? "");
    if (!DATE_RE.test(date))
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    await sql`
      insert into departures (trip_id, date, capacity, closed)
      values (${tripId}, ${date}, ${capacity || 12}, false)
      on conflict (trip_id, date) do update set capacity = excluded.capacity`;
    return NextResponse.json({ ok: true, added: 1 });
  }

  if (body.action === "bulkAdd") {
    const from = parseISO(String(body.from ?? ""));
    const to = parseISO(String(body.to ?? ""));
    if (!from || !to)
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    if (to < from)
      return NextResponse.json({ error: "End date is before start date" }, { status: 400 });

    const weekdays: number[] = Array.isArray(body.weekdays)
      ? body.weekdays.map(Number).filter((n: number) => n >= 0 && n <= 6)
      : [];
    if (weekdays.length === 0)
      return NextResponse.json({ error: "Pick at least one weekday" }, { status: 400 });

    const cap = capacity || 12;
    const dates: string[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (weekdays.includes(d.getDay())) dates.push(iso(d));
    }
    if (dates.length > 1000)
      return NextResponse.json({ error: "Range too large (max 1000 dates)" }, { status: 400 });

    let added = 0;
    for (const date of dates) {
      const res = await sql`
        insert into departures (trip_id, date, capacity, closed)
        values (${tripId}, ${date}, ${cap}, false)
        on conflict (trip_id, date) do nothing
        returning date`;
      added += res.length;
    }
    return NextResponse.json({ ok: true, added, matched: dates.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// PATCH: edit a single departure (capacity / closed) from the calendar editor.
export async function PATCH(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const tripId = String(body.tripId ?? "");
  const date = String(body.date ?? "");
  if (!tripId || !DATE_RE.test(date))
    return NextResponse.json({ error: "Missing tripId/date" }, { status: 400 });

  const closed = body.closed === true;
  const capacity = Math.max(0, Math.round(Number(body.capacity) || 0));
  await sql`
    insert into departures (trip_id, date, capacity, closed)
    values (${tripId}, ${date}, ${capacity || 12}, ${closed})
    on conflict (trip_id, date)
    do update set capacity = excluded.capacity, closed = excluded.closed`;
  return NextResponse.json({ ok: true });
}

// DELETE: single (?tripId&date) or bulk (?tripId&from&to). Departures with paid/
// pending bookings are protected unless force=1.
export async function DELETE(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = new URL(req.url).searchParams;
  const tripId = p.get("tripId") ?? "";
  if (!tripId)
    return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
  const force = p.get("force") === "1";
  const date = p.get("date");
  const from = p.get("from");
  const to = p.get("to");

  if (date) {
    if (!DATE_RE.test(date))
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    if (!force) {
      const [{ booked }] = (await sql`
        select coalesce(sum(quantity),0)::int as booked from bookings
        where trip_id = ${tripId} and travel_date = ${date}
          and status = any(${["pending", "paid"]})`) as { booked: number }[];
      if (booked > 0)
        return NextResponse.json(
          { error: `That departure has ${booked} booked seat(s). Delete anyway?`, needsForce: true },
          { status: 409 }
        );
    }
    await sql`delete from departures where trip_id = ${tripId} and date = ${date}`;
    return NextResponse.json({ ok: true, deleted: 1 });
  }

  if (from && to) {
    if (!DATE_RE.test(from) || !DATE_RE.test(to))
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    // Never delete departures that have bookings (protect paying customers).
    const booked = (await sql`
      select distinct travel_date::text as date from bookings
      where trip_id = ${tripId} and travel_date between ${from} and ${to}
        and status = any(${["pending", "paid"]})`) as { date: string }[];
    const protectedDates = new Set(booked.map((b) => b.date.slice(0, 10)));

    const rows = (await sql`
      select date::text as date from departures
      where trip_id = ${tripId} and date between ${from} and ${to}`) as {
      date: string;
    }[];
    const toDelete = rows
      .map((r) => r.date.slice(0, 10))
      .filter((d) => !protectedDates.has(d));

    for (const d of toDelete) {
      await sql`delete from departures where trip_id = ${tripId} and date = ${d}`;
    }
    return NextResponse.json({
      ok: true,
      deleted: toDelete.length,
      skipped: protectedDates.size,
    });
  }

  return NextResponse.json({ error: "Missing date or range" }, { status: 400 });
}
