"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/money";

type TripRow = {
  id: string;
  name: string;
  route: string | null;
  description: string | null;
  price_idr: number;
  active: boolean;
};

const field =
  "w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200";

export default function TripsManager({ trips }: { trips: TripRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    route: "",
    description: "",
    price_idr: 0,
  });

  async function createTrip(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/admin/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setForm({ name: "", route: "", description: "", price_idr: 0 });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ocean-900">Trips & pricing</h1>

      <form
        onSubmit={createTrip}
        className="rounded-2xl border border-ocean-200 bg-white p-5"
      >
        <h2 className="mb-4 font-semibold text-ocean-900">Add a trip</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className={field}
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={field}
            placeholder="Route (e.g. Ampana – Wakai)"
            value={form.route}
            onChange={(e) => setForm({ ...form, route: e.target.value })}
          />
          <input
            className={field}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            min={0}
            className={field}
            placeholder="Price (IDR) *"
            value={form.price_idr || ""}
            onChange={(e) =>
              setForm({ ...form, price_idr: Number(e.target.value) })
            }
            required
          />
        </div>
        <button
          disabled={creating}
          className="mt-4 flex items-center gap-2 rounded-lg bg-ocean-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-700 disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add trip
        </button>
      </form>

      <div className="space-y-3">
        {trips.length === 0 && <p className="text-ocean-500">No trips yet.</p>}
        {trips.map((t) => (
          <TripEditor key={t.id} trip={t} />
        ))}
      </div>
    </div>
  );
}

function TripEditor({ trip }: { trip: TripRow }) {
  const router = useRouter();
  const [edit, setEdit] = useState(trip);
  const [saving, setSaving] = useState(false);
  const dirty =
    edit.name !== trip.name ||
    edit.route !== trip.route ||
    edit.description !== trip.description ||
    edit.price_idr !== trip.price_idr ||
    edit.active !== trip.active;

  async function save() {
    setSaving(true);
    await fetch("/api/admin/trips", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete "${trip.name}"?`)) return;
    await fetch(`/api/admin/trips?id=${trip.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-ocean-200 bg-white p-4">
      <div className="grid items-center gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1fr_auto]">
        <input
          className={field}
          value={edit.name}
          onChange={(e) => setEdit({ ...edit, name: e.target.value })}
        />
        <input
          className={field}
          value={edit.route ?? ""}
          placeholder="Route"
          onChange={(e) => setEdit({ ...edit, route: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            className={field}
            value={edit.price_idr}
            onChange={(e) =>
              setEdit({ ...edit, price_idr: Number(e.target.value) })
            }
          />
        </div>
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
            className="flex items-center gap-1 rounded-lg bg-ocean-600 px-3 py-2 text-xs font-semibold text-white hover:bg-ocean-700 disabled:opacity-40"
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
      <p className="mt-2 text-xs text-ocean-400">
        Current price: {formatIDR(trip.price_idr)}
      </p>
    </div>
  );
}
