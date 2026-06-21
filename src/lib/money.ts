const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format an integer amount of Rupiah, e.g. 150000 -> "Rp 150.000". */
export function formatIDR(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "Rp 0";
  return idrFormatter.format(Math.round(n));
}

/** Coerce a numeric-ish DB value (Postgres may return numeric as string). */
export function num(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}
