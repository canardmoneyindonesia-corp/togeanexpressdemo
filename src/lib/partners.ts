// Flyer partners = the resort/property pickup points Togean Express serves.
// Each gets a co-branded flyer (partnership badge, highlighted pickup leg, and a
// QR pointing at their own booking link). Static config — only a handful exist.

export type Partner = {
  slug: string;
  name: string; // co-brand name, e.g. "Kadidiri Paradise"
  pickup: string; // schedule leg to highlight: "Kadidiri" | "Ketupat" | "Malenge"
  departTime: string; // morning departure for this property
  accent?: string; // optional brand accent (defaults to Togean orange)
  bookingPath: string; // where the flyer QR points (relative to base URL)
};

export const PARTNERS: Partner[] = [
  {
    slug: "kadidiri",
    name: "Kadidiri Paradise",
    pickup: "Kadidiri",
    departTime: "6:30am",
    bookingPath: "/checkout?from=kadidiri",
  },
  {
    slug: "bolianga",
    name: "Bolianga",
    pickup: "Ketupat",
    departTime: "7:00am",
    bookingPath: "/checkout?from=bolianga",
  },
  {
    slug: "the-cliff",
    name: "The Cliff",
    pickup: "Malenge",
    departTime: "7:45am",
    bookingPath: "/checkout?from=malenge",
  },
];

export function getPartner(slug: string): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
