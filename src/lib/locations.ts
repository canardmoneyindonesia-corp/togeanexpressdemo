// Shared formatter for pick-up / drop-off labels. Used both server-side (to
// build the checkout dropdown options and the admin list) and as the value
// stored on each booking, so guests, emails and the admin all see the same
// human-readable string, e.g. "Kadidiri area (Kadidiri Paradise Resort jetty) — 6:15am".
export function formatLocationLabel(l: {
  area: string;
  place?: string | null;
  time_label?: string | null;
}): string {
  const base = l.place ? `${l.area} (${l.place})` : l.area;
  return l.time_label ? `${base} — ${l.time_label}` : base;
}
