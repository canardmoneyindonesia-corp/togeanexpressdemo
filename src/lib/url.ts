import { headers } from "next/headers";

/** Resolve the app's public base URL (no trailing slash). */
export async function baseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Fall back to the incoming request's host.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
