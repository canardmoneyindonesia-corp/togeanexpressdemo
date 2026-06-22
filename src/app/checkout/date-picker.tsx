"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "./use-is-mobile";
import BottomSheet from "./bottom-sheet";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function parseISO(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

type DayInfo = { seatsLeft: number; closed: boolean; soldOut: boolean };

export default function DatePicker({
  value,
  onChange,
  tripId,
}: {
  value: string;
  onChange: (iso: string) => void;
  tripId?: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = parseISO(value);
  const initial = selected ?? today;

  const [open, setOpen] = useState(false);
  const [viewY, setViewY] = useState(initial.getFullYear());
  const [viewM, setViewM] = useState(initial.getMonth());
  const [avail, setAvail] = useState<Map<string, DayInfo>>(new Map());
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Load seat availability for the visible month / selected route.
  useEffect(() => {
    if (!tripId) {
      setAvail(new Map());
      return;
    }
    let cancelled = false;
    fetch(`/api/availability?tripId=${tripId}&year=${viewY}&month=${viewM + 1}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const m = new Map<string, DayInfo>();
        (data.days ?? []).forEach((d: { date: string } & DayInfo) =>
          m.set(d.date, { seatsLeft: d.seatsLeft, closed: d.closed, soldOut: d.soldOut })
        );
        setAvail(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tripId, viewY, viewM]);

  // Desktop popover dismissal. Mobile uses BottomSheet.
  useEffect(() => {
    if (!open || isMobile) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isMobile]);

  const firstOfMonth = new Date(viewY, viewM, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewY, viewM, d));

  const isPast = (d: Date) => d < today;
  const sameDay = (a: Date, b: Date) => toISO(a) === toISO(b);

  function prevMonth() {
    setViewM((m) => (m === 0 ? 11 : m - 1));
    if (viewM === 0) setViewY((y) => y - 1);
  }
  function nextMonth() {
    setViewM((m) => (m === 11 ? 0 : m + 1));
    if (viewM === 11) setViewY((y) => y + 1);
  }

  const display = selected
    ? selected.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select date";

  const calendar = (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-2 text-ocean-700 hover:bg-ocean-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-ocean-900">
          {MONTHS[viewM]} {viewY}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md p-2 text-ocean-700 hover:bg-ocean-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-ocean-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const info = avail.get(toISO(d));
          // Only scheduled, open, non-sold-out future departures are bookable.
          const unavailable = !info || info.closed || info.soldOut;
          const disabled = isPast(d) || unavailable;
          const isSelected = selected && sameDay(d, selected);
          const showSeats = !!info && !isPast(d) && !info.closed && !info.soldOut;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(toISO(d));
                setOpen(false);
              }}
              className={[
                "flex flex-col items-center justify-center rounded-md text-sm leading-none transition",
                "h-11 sm:h-10",
                isSelected
                  ? "bg-accent-500 font-bold text-white"
                  : disabled
                    ? "cursor-not-allowed text-ocean-200"
                    : "font-medium text-ocean-800 hover:bg-ocean-100",
              ].join(" ")}
            >
              <span>{d.getDate()}</span>
              {showSeats && (
                <span
                  className={`mt-0.5 text-[9px] font-semibold ${
                    isSelected
                      ? "text-white/90"
                      : info!.seatsLeft <= 3
                        ? "text-amber-600"
                        : "text-ocean-400"
                  }`}
                >
                  {info!.seatsLeft} left
                </span>
              )}
              {!isPast(d) && info?.soldOut && (
                <span className="mt-0.5 text-[9px] font-semibold text-amber-500">
                  Full
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 border-t border-ocean-100 pt-2 text-center text-[11px] text-ocean-500">
        Highlighted dates have available departures · seats shown per date
      </p>
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-ocean-200 bg-white px-3 py-2 text-left text-ocean-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30"
      >
        <span className={`truncate ${selected ? "" : "text-ocean-400"}`}>
          {display}
        </span>
        <CalendarDays className="ml-2 h-4 w-4 shrink-0 text-ocean-500" />
      </button>

      {open &&
        (isMobile ? (
          <BottomSheet open onClose={() => setOpen(false)} title="Travel date">
            {calendar}
          </BottomSheet>
        ) : (
          <div className="absolute z-20 mt-2 w-72 rounded-xl border border-ocean-200 bg-white shadow-lg">
            {calendar}
          </div>
        ))}
    </div>
  );
}
