import { sql } from "./db";
import { getTrip } from "./queries";
import { operatingDatesInMonth, isOperatingDay } from "./schedule";

// Pending + paid bookings both occupy seats (prevents oversell during checkout).
const OCCUPYING = ["pending", "paid"];

export type DayAvailability = {
  date: string; // YYYY-MM-DD
  defaultCapacity: number;
  override: number | null; // per-date capacity override, if set
  closed: boolean;
  capacity: number; // effective capacity (0 when closed)
  booked: number;
  seatsLeft: number;
};

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Availability for a single trip + date (used to enforce capacity at checkout). */
export async function getDateAvailability(
  tripId: string,
  date: string
): Promise<DayAvailability & { operating: boolean }> {
  const trip = await getTrip(tripId);
  const defaultCapacity = trip?.capacity ?? 0;

  const deps = (await sql`
    select capacity, closed from departures
    where trip_id = ${tripId} and date = ${date}
  `) as { capacity: number | null; closed: boolean }[];
  const dep = deps[0];

  const booked = Number(
    (
      (await sql`
        select coalesce(sum(quantity), 0)::int as booked from bookings
        where trip_id = ${tripId} and travel_date = ${date}
          and status = any(${OCCUPYING})
      `) as { booked: number }[]
    )[0]?.booked ?? 0
  );

  const closed = dep?.closed ?? false;
  const override = dep?.capacity ?? null;
  const capacity = closed ? 0 : override ?? defaultCapacity;
  const seatsLeft = Math.max(0, capacity - booked);

  return {
    date,
    defaultCapacity,
    override,
    closed,
    capacity,
    booked,
    seatsLeft,
    operating: isOperatingDay(date),
  };
}

/** Availability for every operating day in a month (year, 0-based month). */
export async function getMonthAvailability(
  tripId: string,
  year: number,
  month: number
): Promise<DayAvailability[]> {
  const trip = await getTrip(tripId);
  if (!trip) return [];
  const defaultCapacity = trip.capacity;

  const from = iso(new Date(year, month, 1));
  const to = iso(new Date(year, month + 1, 0));

  const deps = (await sql`
    select date::text as date, capacity, closed from departures
    where trip_id = ${tripId} and date between ${from} and ${to}
  `) as { date: string; capacity: number | null; closed: boolean }[];

  const booked = (await sql`
    select travel_date::text as date, coalesce(sum(quantity), 0)::int as booked
    from bookings
    where trip_id = ${tripId} and travel_date between ${from} and ${to}
      and status = any(${OCCUPYING})
    group by travel_date
  `) as { date: string; booked: number }[];

  const depMap = new Map(deps.map((d) => [d.date.slice(0, 10), d]));
  const bookedMap = new Map(booked.map((b) => [b.date.slice(0, 10), b.booked]));

  return operatingDatesInMonth(year, month).map((date) => {
    const dep = depMap.get(date);
    const closed = dep?.closed ?? false;
    const override = dep?.capacity ?? null;
    const capacity = closed ? 0 : override ?? defaultCapacity;
    const bookedCount = bookedMap.get(date) ?? 0;
    return {
      date,
      defaultCapacity,
      override,
      closed,
      capacity,
      booked: bookedCount,
      seatsLeft: Math.max(0, capacity - bookedCount),
    };
  });
}
