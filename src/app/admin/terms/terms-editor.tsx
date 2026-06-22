"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, ExternalLink } from "lucide-react";

export default function TermsEditor({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = value !== initial;

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "terms", value }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ocean-900">
          Terms &amp; Conditions
        </h1>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-800"
        >
          <ExternalLink className="h-4 w-4" /> View public page
        </a>
      </div>

      <p className="text-sm text-ocean-500">
        This text is shown on the public{" "}
        <span className="font-medium text-ocean-700">/terms</span> page and
        linked from the checkout. Line breaks and blank lines are preserved.
      </p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={20}
        className="w-full resize-y rounded-2xl border border-ocean-200 bg-white p-4 text-[15px] leading-relaxed text-ocean-800 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30"
        placeholder="Enter your terms & conditions…"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        {dirty && !saving && (
          <span className="text-sm text-ocean-400">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
