import { sql } from "./db";
import { getTrip } from "./queries";

// Pending + paid bookings both occupy seats (prevents oversell during checkout).
const OCCUPYING = ["pending", "paid"];

export type DayAvailability = {
  date: string; // YYYY-MM-DD
  capacity: number; // explicit seats for this departure (0 when closed)
  rawCapacity: number; // capacity ignoring the closed flag
  closed: boolean;
  booked: number;
  seatsLeft: number;
};

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Availability for a single trip + date. `scheduled` is false when no departure
 * row exists (the date is simply not on offer). Used to enforce capacity at checkout.
 */
export async function getDateAvailability(
  tripId: string,
  date: string
): Promise<DayAvailability & { scheduled: boolean }> {
  const deps = (await sql`
    select capacity, closed from departures
    where trip_id = ${tripId} and date = ${date}
  `) as { capacity: number; closed: boolean }[];
  const dep = deps[0];

  if (!dep) {
    return {
      date,
      scheduled: false,
      capacity: 0,
      rawCapacity: 0,
      closed: false,
      booked: 0,
      seatsLeft: 0,
    };
  }

  const booked = Number(
    (
      (await sql`
        select coalesce(sum(quantity), 0)::int as booked from bookings
        where trip_id = ${tripId} and travel_date = ${date}
          and status = any(${OCCUPYING})
      `) as { booked: number }[]
    )[0]?.booked ?? 0
  );

  const capacity = dep.closed ? 0 : dep.capacity;
  return {
    date,
    scheduled: true,
    capacity,
    rawCapacity: dep.capacity,
    closed: dep.closed,
    booked,
    seatsLeft: Math.max(0, capacity - booked),
  };
}

/** All scheduled departures for a trip in a month (year, 0-based month). */
export async function getMonthAvailability(
  tripId: string,
  year: number,
  month: number
): Promise<DayAvailability[]> {
  const from = iso(new Date(year, month, 1));
  const to = iso(new Date(year, month + 1, 0));

  const deps = (await sql`
    select date::text as date, capacity, closed from departures
    where trip_id = ${tripId} and date between ${from} and ${to}
    order by date asc
  `) as { date: string; capacity: number; closed: boolean }[];

  const booked = (await sql`
    select travel_date::text as date, coalesce(sum(quantity), 0)::int as booked
    from bookings
    where trip_id = ${tripId} and travel_date between ${from} and ${to}
      and status = any(${OCCUPYING})
    group by travel_date
  `) as { date: string; booked: number }[];

  const bookedMap = new Map(booked.map((b) => [b.date.slice(0, 10), b.booked]));

  return deps.map((dep) => {
    const date = dep.date.slice(0, 10);
    const capacity = dep.closed ? 0 : dep.capacity;
    const bookedCount = bookedMap.get(date) ?? 0;
    return {
      date,
      capacity,
      rawCapacity: dep.capacity,
      closed: dep.closed,
      booked: bookedCount,
      seatsLeft: Math.max(0, capacity - bookedCount),
    };
  });
}

/** The trip's default capacity (used to pre-fill new departures in the admin UI). */
export async function tripDefaultCapacity(tripId: string): Promise<number> {
  const trip = await getTrip(tripId);
  return trip?.capacity ?? 12;
}
