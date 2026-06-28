"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, MapPin } from "lucide-react";
import { formatLocationLabel } from "@/lib/locations";

type LocationKind = "pickup" | "dropoff";

type LocationRow = {
  id: string;
  kind: LocationKind;
  area: string;
  place: string | null;
  time_label: string | null;
  sort_order: number;
  active: boolean;
};

const field =
  "w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200";

export default function LocationsManager({
  locations,
}: {
  locations: LocationRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const blank = {
    kind: "pickup" as LocationKind,
    area: "",
    place: "",
    time_label: "",
    sort_order: 0,
  };
  const [form, setForm] = useState(blank);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setForm(blank);
    router.refresh();
  }

  const pickups = locations.filter((l) => l.kind === "pickup");
  const dropoffs = locations.filter((l) => l.kind === "dropoff");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ocean-900">
          Pick-up &amp; drop-off schedule
        </h1>
        <p className="mt-1 text-sm text-ocean-500">
          These points appear as dropdowns on the guest checkout, so bookings
          always use a recognised location and time.
        </p>
      </div>

      <form
        onSubmit={create}
        className="rounded-2xl border border-ocean-200 bg-white p-5"
      >
        <h2 className="mb-4 font-semibold text-ocean-900">Add a location</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1.4fr_1.4fr_1fr_auto]">
          <select
            className={field}
            value={form.kind}
            onChange={(e) =>
              setForm({ ...form, kind: e.target.value as LocationKind })
            }
          >
            <option value="pickup">Pick-up</option>
            <option value="dropoff">Drop-off</option>
          </select>
          <input
            className={field}
            placeholder="Area * (e.g. Kadidiri area)"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            required
          />
          <input
            className={field}
            placeholder="Place (e.g. Kadidiri Paradise Resort jetty)"
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
          />
          <input
            className={field}
            placeholder="Time (e.g. 6:15am)"
            value={form.time_label}
            onChange={(e) => setForm({ ...form, time_label: e.target.value })}
          />
          <input
            type="number"
            min={0}
            title="Display order (lower shows first)"
            className={`${field} w-20`}
            placeholder="Order"
            value={form.sort_order || ""}
            onChange={(e) =>
              setForm({ ...form, sort_order: Number(e.target.value) })
            }
          />
        </div>
        <button
          disabled={creating}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add location
        </button>
      </form>

      <Section title="Pick-up points" rows={pickups} />
      <Section title="Drop-off points" rows={dropoffs} />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: LocationRow[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-500">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-ocean-500">None yet.</p>
      ) : (
        rows.map((l) => <LocationEditor key={l.id} loc={l} />)
      )}
    </div>
  );
}

function LocationEditor({ loc }: { loc: LocationRow }) {
  const router = useRouter();
  const [edit, setEdit] = useState(loc);
  const [saving, setSaving] = useState(false);
  const dirty =
    edit.kind !== loc.kind ||
    edit.area !== loc.area ||
    edit.place !== loc.place ||
    edit.time_label !== loc.time_label ||
    edit.sort_order !== loc.sort_order ||
    edit.active !== loc.active;

  async function save() {
    setSaving(true);
    await fetch("/api/admin/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete "${formatLocationLabel(loc)}"?`)) return;
    await fetch(`/api/admin/locations?id=${loc.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-ocean-200 bg-white p-4">
      <div className="grid items-center gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1.4fr_1.4fr_1fr_auto_auto]">
        <select
          className={field}
          value={edit.kind}
          onChange={(e) =>
            setEdit({ ...edit, kind: e.target.value as LocationKind })
          }
        >
          <option value="pickup">Pick-up</option>
          <option value="dropoff">Drop-off</option>
        </select>
        <input
          className={field}
          value={edit.area}
          placeholder="Area"
          onChange={(e) => setEdit({ ...edit, area: e.target.value })}
        />
        <input
          className={field}
          value={edit.place ?? ""}
          placeholder="Place"
          onChange={(e) => setEdit({ ...edit, place: e.target.value })}
        />
        <input
          className={field}
          value={edit.time_label ?? ""}
          placeholder="Time"
          onChange={(e) => setEdit({ ...edit, time_label: e.target.value })}
        />
        <input
          type="number"
          min={0}
          title="Display order"
          className={`${field} w-16`}
          value={edit.sort_order}
          onChange={(e) =>
            setEdit({ ...edit, sort_order: Number(e.target.value) })
          }
        />
        <div className="flex items-center justify-end gap-2">
          <label className="flex items-center gap-1.5 text-sm text-ocean-600">
            <input
              type="checkbox"
              checked={edit.active}
              onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
            />
            Active
          </label>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1 rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-white hover:bg-accent-600 disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
          <button
            onClick={remove}
            className="rounded-lg p-2 text-ocean-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ocean-400">
        <MapPin className="h-3.5 w-3.5" />
        Guests will see: {formatLocationLabel(loc)}
      </p>
    </div>
  );
}
