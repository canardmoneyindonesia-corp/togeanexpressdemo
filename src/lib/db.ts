import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Lazily construct the Neon client on first query so `next build` (which has no
// env vars and never runs these dynamic routes) doesn't fail at import time.
let _client: NeonQueryFunction<false, false> | null = null;

function client(): NeonQueryFunction<false, false> {
  if (!_client) {
    const cs = process.env.DATABASE_URL;
    if (!cs) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example -> .env.local and fill it in."
      );
    }
    _client = neon(cs);
  }
  return _client;
}

// `sql` is a tagged-template query function. Parameters are passed safely.
//   await sql`select * from agents where slug = ${slug}`
export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  client()(strings, ...values)) as NeonQueryFunction<false, false>;

// ---- Row types ----

export type Agent = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  phone: string | null;
  commission_pct: number;
  active: boolean;
  created_at: string;
};

export type Trip = {
  id: string;
  name: string;
  route: string | null;
  description: string | null;
  price_idr: number;
  capacity: number;
  active: boolean;
  created_at: string;
};

export type LocationKind = "pickup" | "dropoff";

export type Location = {
  id: string;
  kind: LocationKind;
  area: string;
  place: string | null;
  time_label: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type BookingStatus = "pending" | "paid" | "expired" | "failed";

export type Booking = {
  id: string;
  trip_id: string | null;
  trip_name: string | null;
  agent_slug: string | null;
  agent_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  pickup: string | null;
  dropoff: string | null;
  travel_date: string | null;
  quantity: number;
  unit_price_idr: number;
  amount_idr: number;
  commission_pct: number;
  commission_idr: number;
  status: BookingStatus;
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  created_at: string;
  paid_at: string | null;
};
