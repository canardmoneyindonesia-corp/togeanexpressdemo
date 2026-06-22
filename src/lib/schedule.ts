// Togean Express departs Mon / Wed / Sat. Shared by the checkout date picker
// and the admin capacity calendar so they always agree.
export const OPERATING_DAYS = [1, 3, 6]; // JS getDay(): Sun=0 … Sat=6

export function isOperatingDay(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return false;
  return OPERATING_DAYS.includes(new Date(y, m - 1, d).getDay());
}

/** All operating-day ISO dates within a calendar month (year, 0-based month). */
export function operatingDatesInMonth(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate();
  const out: string[] = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    if (OPERATING_DAYS.includes(date.getDay())) {
      out.push(
        `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      );
    }
  }
  return out;
}
