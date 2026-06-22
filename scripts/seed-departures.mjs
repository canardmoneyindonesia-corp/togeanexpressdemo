// Explicit-departures migration + seeding.
// - Backfills NULL capacities, makes departures.capacity NOT NULL.
// - Seeds the historical Mon/Wed/Sat schedule as explicit departure rows so
//   booking keeps working after the switch to an explicit schedule.
// Run with:  node --env-file=.env.local scripts/seed-departures.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

const DEFAULT_OPERATING_DAYS = [1, 3, 6]; // Mon, Wed, Sat
const SEED_DAYS = 180;

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export async function migrateDepartures(sqlc, { quiet = false } = {}) {
  const log = (...a) => !quiet && console.log(...a);

  // Backfill + enforce NOT NULL capacity.
  await sqlc`update departures d set capacity = t.capacity from trips t where d.trip_id = t.id and d.capacity is null`;
  await sqlc`update departures set capacity = 12 where capacity is null`;
  await sqlc`alter table departures alter column capacity set not null`;

  // Seed the recurring Mon/Wed/Sat schedule for active trips (skip existing).
  const trips = await sqlc`select id, capacity from trips where active = true`;
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  let inserted = 0;
  for (const trip of trips) {
    for (let i = 0; i < SEED_DAYS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (!DEFAULT_OPERATING_DAYS.includes(d.getDay())) continue;
      const res = await sqlc`
        insert into departures (trip_id, date, capacity, closed)
        values (${trip.id}, ${iso(d)}, ${trip.capacity}, false)
        on conflict (trip_id, date) do nothing`;
      inserted += res.length ? 0 : 0; // neon returns [] on no-op; count separately
    }
  }
  // Count what now exists for visibility.
  const [{ count }] = await sqlc`select count(*)::int as count from departures`;
  log(`Departures migration done. Total departure rows: ${count}`);
  return count;
}

// Allow running standalone.
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDepartures(sql).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
