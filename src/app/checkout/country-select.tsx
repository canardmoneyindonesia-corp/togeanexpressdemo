"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import {
  orderedCountries,
  dialForIso,
  flagEmoji,
  type Country,
} from "@/lib/country-codes";
import { useIsMobile } from "./use-is-mobile";
import BottomSheet from "./bottom-sheet";

export default function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const { popular, rest } = useMemo(() => orderedCountries(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const match = (c: Country) =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.iso.toLowerCase().includes(q);
    return [...popular, ...rest].filter(match);
  }, [query, popular, rest]);

  // Desktop popover: outside-click + Escape close. Focus the search.
  // (Mobile uses BottomSheet, which manages its own dismissal.)
  useEffect(() => {
    if (!open) return;
    if (!isMobile) inputRef.current?.focus();
    if (isMobile) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(iso: string) {
    onChange(iso);
    close();
  }

  function Row({ c }: { c: Country }) {
    const active = c.iso === value;
    return (
      <button
        type="button"
        onClick={() => pick(c.iso)}
        className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition hover:bg-ocean-100 sm:py-2 ${
          active ? "bg-ocean-50" : ""
        }`}
      >
        <span className="text-base leading-none">{flagEmoji(c.iso)}</span>
        <span className="flex-1 truncate text-ocean-800">{c.name}</span>
        <span className="text-ocean-500">{c.dial}</span>
        {active && <Check className="h-4 w-4 text-accent-500" />}
      </button>
    );
  }

  const searchBar = (
    <div className="flex items-center gap-2 border-b border-ocean-100 px-4 py-2.5">
      <Search className="h-4 w-4 shrink-0 text-ocean-400" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search country or code"
        className="w-full bg-transparent text-sm text-ocean-900 outline-none placeholder:text-ocean-400"
      />
    </div>
  );

  const list = (
    <div className="min-h-0 flex-1 overflow-y-auto py-1">
      {filtered ? (
        filtered.length ? (
          filtered.map((c) => <Row key={c.iso} c={c} />)
        ) : (
          <p className="px-4 py-6 text-center text-sm text-ocean-400">
            No matches
          </p>
        )
      ) : (
        <>
          <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-ocean-400">
            Popular
          </p>
          {popular.map((c) => (
            <Row key={c.iso} c={c} />
          ))}
          <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-ocean-400">
            All countries
          </p>
          {rest.map((c) => (
            <Row key={c.iso} c={c} />
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="relative w-24 shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Country code"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-1 rounded-lg border border-ocean-200 bg-white px-2.5 py-2 text-ocean-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30"
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-base leading-none">{flagEmoji(value)}</span>
          <span className="text-sm">{dialForIso(value)}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ocean-500" />
      </button>

      {open &&
        (isMobile ? (
          <BottomSheet open onClose={close} title="Select country">
            {searchBar}
            {list}
          </BottomSheet>
        ) : (
          <div
            role="listbox"
            className="absolute left-0 z-30 mt-2 flex max-h-72 w-72 flex-col overflow-hidden rounded-xl border border-ocean-200 bg-white shadow-lg"
          >
            {searchBar}
            {list}
          </div>
        ))}
    </div>
  );
}
