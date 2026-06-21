import { sql, type Agent, type Trip, type Booking } from "./db";

// ---- Trips ----

export async function getActiveTrips(): Promise<Trip[]> {
  return (await sql`
    select * from trips where active = true order by price_idr asc
  `) as Trip[];
}

export async function getAllTrips(): Promise<Trip[]> {
  return (await sql`select * from trips order by created_at asc`) as Trip[];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const rows = (await sql`select * from trips where id = ${id}`) as Trip[];
  return rows[0] ?? null;
}

// ---- Agents ----

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const rows = (await sql`
    select * from agents where slug = ${slug} and active = true
  `) as Agent[];
  return rows[0] ?? null;
}

export async function getAllAgents(): Promise<Agent[]> {
  return (await sql`select * from agents order by created_at desc`) as Agent[];
}

// ---- Bookings ----

export async function getBooking(id: string): Promise<Booking | null> {
  const rows = (await sql`select * from bookings where id = ${id}`) as Booking[];
  return rows[0] ?? null;
}

export async function getAllBookings(): Promise<Booking[]> {
  return (await sql`
    select * from bookings order by created_at desc limit 500
  `) as Booking[];
}

export type CommissionSummary = {
  agent_slug: string | null;
  bookings: number;
  paid_revenue: number;
  commission_owed: number;
};

export async function getCommissionSummary(): Promise<CommissionSummary[]> {
  return (await sql`
    select
      agent_slug,
      count(*)::int as bookings,
      coalesce(sum(amount_idr) filter (where status = 'paid'), 0)::bigint as paid_revenue,
      coalesce(sum(commission_idr) filter (where status = 'paid'), 0)::bigint as commission_owed
    from bookings
    where agent_slug is not null
    group by agent_slug
    order by commission_owed desc
  `) as unknown as CommissionSummary[];
}
