// Initialize the Neon Postgres schema and seed sample data.
// Run with:  npm run db:init   (loads .env.local automatically)
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example -> .env.local and fill it in.");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log("Creating tables…");

  await sql`
    create table if not exists agents (
      id text primary key,
      slug text unique not null,
      name text not null,
      email text,
      phone text,
      commission_pct numeric not null default 10,
      active boolean not null default true,
      created_at timestamptz not null default now()
    )`;

  await sql`
    create table if not exists trips (
      id text primary key,
      name text not null,
      route text,
      description text,
      price_idr bigint not null,
      active boolean not null default true,
      created_at timestamptz not null default now()
    )`;

  await sql`
    create table if not exists bookings (
      id text primary key,
      trip_id text references trips(id),
      trip_name text,
      agent_slug text,
      agent_id text,
      customer_name text,
      customer_email text,
      customer_phone text,
      travel_date date,
      quantity int not null default 1,
      unit_price_idr bigint not null,
      amount_idr bigint not null,
      commission_pct numeric not null default 0,
      commission_idr bigint not null default 0,
      status text not null default 'pending',
      xendit_invoice_id text,
      xendit_invoice_url text,
      created_at timestamptz not null default now(),
      paid_at timestamptz
    )`;

  await sql`create index if not exists idx_bookings_agent on bookings (agent_slug)`;
  await sql`create index if not exists idx_bookings_status on bookings (status)`;

  // Seed trips if empty.
  const [{ count: tripCount }] = await sql`select count(*)::int as count from trips`;
  if (tripCount === 0) {
    console.log("Seeding trips…");
    const trips = [
      { name: "Luwuk Airport → Togean", route: "Luwuk Airport – Togean", price: 1500000, desc: "Transfer from Luwuk Airport to the Togean Islands." },
      { name: "Togean → Luwuk Airport", route: "Togean – Luwuk Airport", price: 1500000, desc: "Transfer from the Togean Islands to Luwuk Airport." },
    ];
    for (const t of trips) {
      await sql`
        insert into trips (id, name, route, description, price_idr, active)
        values (${randomUUID()}, ${t.name}, ${t.route}, ${t.desc}, ${t.price}, true)`;
    }
  }

  // Seed a demo agent if empty.
  const [{ count: agentCount }] = await sql`select count(*)::int as count from agents`;
  if (agentCount === 0) {
    console.log("Seeding demo agent…");
    await sql`
      insert into agents (id, slug, name, email, commission_pct, active)
      values (${randomUUID()}, 'demo', 'Demo Travel Agency', 'demo@example.com', 15, true)`;
  }

  console.log("Done. ✅");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
