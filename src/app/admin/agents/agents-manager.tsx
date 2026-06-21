"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Copy, Check, Download, Trash2, Loader2 } from "lucide-react";

type AgentRow = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  phone: string | null;
  commission_pct: number;
  active: boolean;
  link: string;
  qr: string;
};

export default function AgentsManager({ agents }: { agents: AgentRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    commission_pct: 10,
  });

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error || "Failed to create agent");
      return;
    }
    setForm({ name: "", slug: "", email: "", phone: "", commission_pct: 10 });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this agent? Their past bookings are kept.")) return;
    await fetch(`/api/admin/agents?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const field =
    "w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ocean-900">Agents</h1>

      {/* Create form */}
      <form
        onSubmit={createAgent}
        className="rounded-2xl border border-ocean-200 bg-white p-5"
      >
        <h2 className="mb-4 font-semibold text-ocean-900">Add an agent</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className={field}
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={field}
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            className={field}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={field}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              className={field}
              value={form.commission_pct}
              onChange={(e) =>
                setForm({ ...form, commission_pct: Number(e.target.value) })
              }
            />
            <span className="text-sm text-ocean-500">%</span>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          disabled={creating}
          className="mt-4 flex items-center gap-2 rounded-lg bg-ocean-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-700 disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add agent
        </button>
      </form>

      {/* Agent cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {agents.length === 0 && (
          <p className="text-ocean-500">No agents yet.</p>
        )}
        {agents.map((a) => (
          <AgentCard key={a.id} agent={a} onDelete={() => remove(a.id)} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  onDelete,
}: {
  agent: AgentRow;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(agent.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-ocean-200 bg-white p-4">
      <Image
        src={agent.qr}
        alt={`QR for ${agent.name}`}
        width={104}
        height={104}
        unoptimized
        className="h-26 w-26 shrink-0 rounded-lg border border-ocean-100"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ocean-900">
              {agent.name}
            </p>
            <p className="text-sm text-ocean-500">
              {agent.commission_pct}% commission
              {!agent.active && " · inactive"}
            </p>
          </div>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-ocean-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 truncate rounded-lg bg-ocean-50 px-2 py-1.5 text-xs text-ocean-600">
          {agent.link}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded-lg border border-ocean-200 px-2.5 py-1.5 text-xs font-medium text-ocean-700 hover:bg-ocean-50"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            href={agent.qr}
            download={`togean-express-${agent.slug}-qr.png`}
            className="flex items-center gap-1 rounded-lg border border-ocean-200 px-2.5 py-1.5 text-xs font-medium text-ocean-700 hover:bg-ocean-50"
          >
            <Download className="h-3.5 w-3.5" />
            QR
          </a>
        </div>
      </div>
    </div>
  );
}
