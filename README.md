# Togean Express

A simple Next.js (standalone) app for a speedboat operator:

- **Checkout page** reachable from a per-agent **QR code / link** that auto-fills the
  **partner** field and tracks commission.
- **Xendit** (test mode) hosted invoice for payment.
- **Admin panel** to manage agents (+ QR/links), view bookings & commissions, and
  edit trips/pricing.

## Stack

- Next.js 16 (App Router, `output: "standalone"`) · React 19 · Tailwind CSS 4
- Neon Postgres (`@neondatabase/serverless`)
- Xendit Invoice API (test mode)
- QR generation via `qrcode`

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Configure env** — copy and fill in:

   ```bash
   cp .env.example .env.local
   ```

   | Variable                | What it is                                                        |
   | ----------------------- | ----------------------------------------------------------------- |
   | `DATABASE_URL`          | Neon pooled connection string                                     |
   | `XENDIT_SECRET_KEY`     | Xendit **test** secret key (`xnd_development_…`)                   |
   | `XENDIT_WEBHOOK_TOKEN`  | Xendit webhook verification token (optional but recommended)      |
   | `ADMIN_PASSWORD`        | Password for the admin panel                                      |
   | `SESSION_SECRET`        | Long random string to sign the admin cookie                       |
   | `NEXT_PUBLIC_BASE_URL`  | Public URL of the app (e.g. `http://localhost:3000`)              |

3. **Create tables + seed sample data**

   ```bash
   npm run db:init
   ```

   Seeds 3 sample trips and one demo agent (`/a/demo`).

4. **Run**

   ```bash
   npm run dev
   ```

   - Storefront: <http://localhost:3000>
   - Checkout: <http://localhost:3000/checkout>
   - Agent link (auto-fills partner): <http://localhost:3000/a/demo>
   - Admin: <http://localhost:3000/admin>

## How it works

### Agent links & commission

- Each agent has a unique `slug`. Their link is `/<base>/a/<slug>`, which redirects to
  `/checkout?partner=<slug>` and pre-fills (read-only) the partner field.
- The admin **Agents** page shows each agent's link + a downloadable **QR code**.
- On checkout the agent's `commission_pct` is snapshotted onto the booking, so
  commission is computed and tracked per booking and rolled up on the dashboard.

### Payment (Xendit)

- `POST /api/checkout` creates a `pending` booking, then a Xendit invoice, and returns
  the hosted `invoice_url`. The browser is redirected there to pay.
- After payment Xendit redirects to `/booking/<id>`.
- **Source of truth** for paid status is the webhook:
  `POST /api/xendit/webhook`. Set this URL in
  Xendit dashboard → Settings → Webhooks (Invoices paid), and put the
  verification token in `XENDIT_WEBHOOK_TOKEN`.
  - For local testing, expose your machine (e.g. `ngrok http 3000`) and use that
    HTTPS URL for both the webhook and `NEXT_PUBLIC_BASE_URL`.

## Deploy (Vercel)

1. Push the repo to GitHub, then "Import Project" in Vercel (or run `npx vercel`).
   The Neon serverless driver and Xendit calls work as-is on Vercel's serverless
   runtime — no extra config.
2. In **Vercel → Project → Settings → Environment Variables**, add the same keys
   as `.env.local`:
   `DATABASE_URL`, `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`, `ADMIN_PASSWORD`,
   `SESSION_SECRET`, and `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain, e.g.
   `https://togeanexpress.vercel.app`, so QR codes/links use the stable domain).
   > `.env.local` is gitignored and is **not** deployed — set these in the dashboard.
3. After the first deploy, point Xendit's webhook at the live URL:
   **Xendit → Settings → Webhooks → Invoices paid** →
   `https://<your-vercel-domain>/api/xendit/webhook`.
4. Run the one-time DB seed against Neon (locally is fine, same database):
   `npm run db:init`.

That's it — the public HTTPS URL means no tunnel (ngrok/cloudflared) is needed for
the webhook.
