"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ban,
  Plus,
  Trash2,
  CalendarPlus,
  CalendarX,
} from "lucide-react";

type DayAvailability = {
  date: string;
  capacity: number;
  rawCapacity: number;
  closed: boolean;
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

export default function TripCalendar({
  tripId,
  defaultCapacity,
}: {
  tripId: string;
  defaultCapacity: number;
}) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [days, setDays] = useState<Map<string, DayAvailability>>(new Map());
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string | null>(null);
  const [capText, setCapText] = useState("");
  const [closed, setClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  const [panel, setPanel] = useState<null | "bulkAdd" | "bulkDelete">(null);

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

  function openDay(isoDate: string) {
    const day = days.get(isoDate);
    setSelected(isoDate);
    setCapText(day ? String(day.rawCapacity) : String(defaultCapacity));
    setClosed(day?.closed ?? false);
  }

  // Save edits to an existing departure (PATCH).
  async function saveDay() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/departures", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId,
        date: selected,
        capacity: capText === "" ? defaultCapacity : Number(capText),
        closed,
      }),
    });
    setSaving(false);
    setSelected(null);
    await load();
  }

  // Add a new departure on an unscheduled day (POST add).
  async function addDay() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/departures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        tripId,
        date: selected,
        capacity: capText === "" ? defaultCapacity : Number(capText),
      }),
    });
    setSaving(false);
    setSelected(null);
    await load();
  }

  // Delete a single departure (DELETE), with booked-seat confirmation.
  async function deleteDay(force = false) {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(
      `/api/admin/departures?tripId=${tripId}&date=${selected}${force ? "&force=1" : ""}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    setSaving(false);
    if (res.status === 409 && data.needsForce) {
      if (confirm(data.error)) return deleteDay(true);
      return;
    }
    setSelected(null);
    await load();
  }

  const firstOfMonth = new Date(viewY, viewM, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewY, viewM, d));

  const selectedDay = selected ? days.get(selected) : null;
  const selectedIsPast = selected ? new Date(selected) < today : false;

  return (
    <div className="mt-3 rounded-xl border border-ocean-100 bg-ocean-50/40 p-3">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPanel(panel === "bulkAdd" ? null : "bulkAdd")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            panel === "bulkAdd"
              ? "border-ocean-500 bg-ocean-100 text-ocean-800"
              : "border-ocean-200 text-ocean-700 hover:bg-ocean-50"
          }`}
        >
          <CalendarPlus className="h-3.5 w-3.5" /> Bulk add
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === "bulkDelete" ? null : "bulkDelete")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            panel === "bulkDelete"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-ocean-200 text-ocean-700 hover:bg-ocean-50"
          }`}
        >
          <CalendarX className="h-3.5 w-3.5" /> Bulk delete
        </button>
      </div>

      {panel === "bulkAdd" && (
        <BulkAddPanel
          tripId={tripId}
          defaultCapacity={defaultCapacity}
          defaultMonth={{ y: viewY, m: viewM }}
          onDone={() => {
            setPanel(null);
            load();
          }}
        />
      )}
      {panel === "bulkDelete" && (
        <BulkDeletePanel
          tripId={tripId}
          defaultMonth={{ y: viewY, m: viewM }}
          onDone={() => {
            setPanel(null);
            load();
          }}
        />
      )}

      {/* Month nav */}
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
          const isPast = d < today;
          const isSel = selected === isoDate;

          if (!day) {
            // Unscheduled. Future days can be clicked to add a departure.
            return (
              <button
                key={i}
                type="button"
                disabled={isPast}
                onClick={() => openDay(isoDate)}
                className={`group flex h-14 flex-col items-center justify-center rounded-md border border-dashed text-xs transition ${
                  isPast
                    ? "border-transparent text-ocean-200"
                    : "border-ocean-200 text-ocean-300 hover:border-ocean-400 hover:text-ocean-600"
                } ${isSel ? "ring-2 ring-ocean-500" : ""}`}
              >
                <span>{d.getDate()}</span>
                {!isPast && (
                  <Plus className="mt-0.5 h-3 w-3 opacity-0 group-hover:opacity-100" />
                )}
              </button>
            );
          }

          const state = day.closed
            ? "border-red-200 bg-red-50 text-red-700"
            : day.seatsLeft <= 0
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-ocean-300 bg-white text-ocean-800";
          return (
            <button
              key={i}
              type="button"
              onClick={() => openDay(isoDate)}
              className={`flex h-14 flex-col items-center justify-center rounded-md border text-xs transition hover:ring-2 hover:ring-ocean-300 ${state} ${
                isSel ? "ring-2 ring-ocean-500" : ""
              } ${isPast ? "opacity-60" : ""}`}
            >
              <span className="font-bold">{d.getDate()}</span>
              {day.closed ? (
                <span className="mt-0.5 flex items-center gap-0.5 text-[10px] font-semibold">
                  <Ban className="h-3 w-3" /> Closed
                </span>
              ) : (
                <span className="mt-0.5 text-[10px] font-semibold">
                  {day.booked}/{day.rawCapacity}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ocean-500">
        <span><b className="text-ocean-700">booked/seats</b> on scheduled days</span>
        <span className="text-amber-600">amber = sold out</span>
        <span className="text-red-600">red = closed</span>
        <span className="text-ocean-400">dashed = no departure (click to add)</span>
      </div>

      {/* Day editor */}
      {selected && (
        <div className="mt-3 rounded-xl border border-ocean-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ocean-900">
              {new Date(selected).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {selectedDay && (
              <span className="text-sm text-ocean-500">
                {selectedDay.booked} booked
              </span>
            )}
          </div>

          {!selectedDay && (
            <p className="mb-3 text-sm text-ocean-500">
              No departure scheduled on this date.
            </p>
          )}

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
                placeholder={`Default ${defaultCapacity}`}
                className="w-36 rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30 disabled:bg-ocean-50 disabled:text-ocean-300"
              />
            </div>
            {selectedDay && (
              <label className="flex items-center gap-2 pb-2 text-sm text-ocean-700">
                <input
                  type="checkbox"
                  checked={closed}
                  onChange={(e) => setClosed(e.target.checked)}
                  className="h-4 w-4 accent-red-500"
                />
                Close (stop sales)
              </label>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {selectedDay ? (
              <>
                <button
                  type="button"
                  onClick={saveDay}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => deleteDay()}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete departure
                </button>
              </>
            ) : (
              !selectedIsPast && (
                <button
                  type="button"
                  onClick={addDay}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add departure
                </button>
              )
            )}
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

function monthRange(y: number, m: number) {
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { from: iso(first), to: iso(last) };
}

function BulkAddPanel({
  tripId,
  defaultCapacity,
  defaultMonth,
  onDone,
}: {
  tripId: string;
  defaultCapacity: number;
  defaultMonth: { y: number; m: number };
  onDone: () => void;
}) {
  const r = monthRange(defaultMonth.y, defaultMonth.m);
  const [from, setFrom] = useState(r.from);
  const [to, setTo] = useState(r.to);
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 6]);
  const [capacity, setCapacity] = useState(defaultCapacity);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function toggle(d: number) {
    setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]));
  }

  async function submit() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/departures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulkAdd", tripId, from, to, weekdays, capacity }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg(`Added ${data.added} departure(s) (${data.matched} matched, ${data.matched - data.added} already existed).`);
    onDone();
  }

  const inp =
    "rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30";

  return (
    <div className="mb-3 rounded-xl border border-ocean-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-ocean-900">Bulk add departures</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ocean-700">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ocean-700">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ocean-700">Seats</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className={`${inp} w-24`}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-semibold text-ocean-700">On weekdays</label>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((w, idx) => (
            <button
              key={w}
              type="button"
              onClick={() => toggle(idx)}
              className={`h-9 w-10 rounded-lg border text-xs font-semibold transition ${
                weekdays.includes(idx)
                  ? "border-ocean-500 bg-ocean-500 text-white"
                  : "border-ocean-200 text-ocean-500 hover:bg-ocean-50"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-ocean-600">{msg}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-4 flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
        Add departures
      </button>
    </div>
  );
}

function BulkDeletePanel({
  tripId,
  defaultMonth,
  onDone,
}: {
  tripId: string;
  defaultMonth: { y: number; m: number };
  onDone: () => void;
}) {
  const r = monthRange(defaultMonth.y, defaultMonth.m);
  const [from, setFrom] = useState(r.from);
  const [to, setTo] = useState(r.to);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!confirm(`Delete all departures between ${from} and ${to}? Departures with bookings are kept.`))
      return;
    setBusy(true);
    setMsg(null);
    const res = await fetch(
      `/api/admin/departures?tripId=${tripId}&from=${from}&to=${to}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg(`Deleted ${data.deleted}, kept ${data.skipped} with bookings.`);
    onDone();
  }

  const inp =
    "rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30";

  return (
    <div className="mb-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
      <p className="mb-3 text-sm font-semibold text-red-700">Bulk delete departures</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ocean-700">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ocean-700">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-ocean-600">{msg}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-4 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete departures
      </button>
    </div>
  );
}
