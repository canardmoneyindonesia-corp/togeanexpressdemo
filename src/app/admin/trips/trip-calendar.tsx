"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Ban, RotateCcw } from "lucide-react";

type DayAvailability = {
  date: string;
  defaultCapacity: number;
  override: number | null;
  closed: boolean;
  capacity: number;
  booked: number;
  seatsLeft: number;
};

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

export default function TripCalendar({ tripId }: { tripId: string }) {
  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [days, setDays] = useState<Map<string, DayAvailability>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [capText, setCapText] = useState("");
  const [closed, setClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/departures?tripId=${tripId}&year=${viewY}&month=${viewM + 1}`
    );
    const data = await res.json();
    const map = new Map<string, DayAvailability>();
    (data.days ?? []).forEach((d: DayAvailability) => map.set(d.date, d));
    setDays(map);
    setLoading(false);
  }, [tripId, viewY, viewM]);

  useEffect(() => {
    load();
  }, [load]);

  function prevMonth() {
    setSelected(null);
    setViewM((m) => (m === 0 ? 11 : m - 1));
    if (viewM === 0) setViewY((y) => y - 1);
  }
  function nextMonth() {
    setSelected(null);
    setViewM((m) => (m === 11 ? 0 : m + 1));
    if (viewM === 11) setViewY((y) => y + 1);
  }

  function openEditor(day: DayAvailability) {
    setSelected(day.date);
    setCapText(day.override != null ? String(day.override) : "");
    setClosed(day.closed);
  }

  async function save(reset = false) {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/departures", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId,
        date: selected,
        capacity: reset ? null : capText === "" ? null : Number(capText),
        closed: reset ? false : closed,
      }),
    });
    setSaving(false);
    setSelected(null);
    await load();
  }

  // Build the month grid.
  const firstOfMonth = new Date(viewY, viewM, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewY, viewM, d));

  const selectedDay = selected ? days.get(selected) : null;

  return (
    <div className="mt-3 rounded-xl border border-ocean-100 bg-ocean-50/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-2 text-ocean-700 hover:bg-ocean-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex items-center gap-2 text-sm font-bold text-ocean-900">
          {MONTHS[viewM]} {viewY}
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean-400" />}
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
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isoDate = toISO(d);
          const day = days.get(isoDate);
          if (!day) {
            // Non-operating day (no departure scheduled).
            return (
              <div
                key={i}
                className="flex h-14 flex-col items-center justify-center rounded-md text-xs text-ocean-200"
              >
                {d.getDate()}
              </div>
            );
          }
          const isSel = selected === isoDate;
          const state = day.closed
            ? "border-red-200 bg-red-50 text-red-700"
            : day.seatsLeft <= 0
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : day.booked > 0
                ? "border-ocean-300 bg-white text-ocean-800"
                : "border-ocean-200 bg-white text-ocean-700";
          return (
            <button
              key={i}
              type="button"
              onClick={() => openEditor(day)}
              className={`flex h-14 flex-col items-center justify-center rounded-md border text-xs transition hover:ring-2 hover:ring-ocean-300 ${state} ${
                isSel ? "ring-2 ring-ocean-500" : ""
              }`}
            >
              <span className="font-bold">{d.getDate()}</span>
              {day.closed ? (
                <span className="mt-0.5 flex items-center gap-0.5 text-[10px] font-semibold">
                  <Ban className="h-3 w-3" /> Closed
                </span>
              ) : (
                <span className="mt-0.5 text-[10px] font-semibold">
                  {day.booked}/{day.capacity}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ocean-500">
        <span><b className="text-ocean-700">booked/seats</b> per departure</span>
        <span className="text-amber-600">amber = sold out</span>
        <span className="text-red-600">red = closed</span>
      </div>

      {/* Day editor */}
      {selectedDay && (
        <div className="mt-3 rounded-xl border border-ocean-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ocean-900">
              {new Date(selectedDay.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <span className="text-sm text-ocean-500">
              {selectedDay.booked} booked
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-700">
                Capacity (seats)
              </label>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={capText}
                disabled={closed}
                onChange={(e) =>
                  setCapText(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder={`Default ${selectedDay.defaultCapacity}`}
                className="w-36 rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30 disabled:bg-ocean-50 disabled:text-ocean-300"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-ocean-700">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => setClosed(e.target.checked)}
                className="h-4 w-4 accent-red-500"
              />
              Close this departure
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-ocean-200 px-3 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to default
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg px-3 py-2 text-sm text-ocean-500 hover:bg-ocean-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
