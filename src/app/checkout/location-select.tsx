"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, MapPin } from "lucide-react";
import { useIsMobile } from "./use-is-mobile";
import BottomSheet from "./bottom-sheet";

/** Split "Area (Place) — 6:15am" into the location text and the time tag. */
function splitOption(option: string): { main: string; time: string | null } {
  const i = option.indexOf(" — ");
  if (i === -1) return { main: option, time: null };
  return { main: option.slice(0, i), time: option.slice(i + 3) };
}

export default function LocationSelect({
  options,
  value,
  onChange,
  placeholder,
  title,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const selected = splitOption(value);

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

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  const list = (
    <div className="min-h-0 flex-1 overflow-y-auto py-1">
      {options.map((o) => {
        const active = o === value;
        const { main, time } = splitOption(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => pick(o)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-ocean-100 sm:py-2.5 ${
              active ? "bg-ocean-50" : ""
            }`}
          >
            <span className="min-w-0 flex-1 text-sm font-medium text-ocean-900">
              {main}
            </span>
            {time && (
              <span className="shrink-0 text-sm font-bold text-accent-500">
                {time}
              </span>
            )}
            {active && <Check className="h-4 w-4 shrink-0 text-accent-500" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg border border-ocean-200 bg-white px-3 py-2 text-left text-ocean-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/30"
      >
        <MapPin className="h-4 w-4 shrink-0 text-ocean-500" />
        <span
          className={`min-w-0 flex-1 truncate ${
            value ? "font-medium" : "text-ocean-400"
          }`}
        >
          {value ? selected.main : placeholder}
        </span>
        {value && selected.time && (
          <span className="shrink-0 text-sm font-bold text-accent-500">
            {selected.time}
          </span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-ocean-500" />
      </button>

      {open &&
        (isMobile ? (
          <BottomSheet open onClose={() => setOpen(false)} title={title}>
            {list}
          </BottomSheet>
        ) : (
          <div
            role="listbox"
            className="absolute left-0 z-30 mt-2 flex max-h-72 w-full flex-col overflow-hidden rounded-xl border border-ocean-200 bg-white shadow-lg"
          >
            {list}
          </div>
        ))}
    </div>
  );
}
