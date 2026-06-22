"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, MapPin } from "lucide-react";
import { formatIDR } from "@/lib/money";
import { useIsMobile } from "./use-is-mobile";
import BottomSheet from "./bottom-sheet";

type TripOption = {
  id: string;
  name: string;
  route: string | null;
  price_idr: number;
};

export default function RouteSelect({
  trips,
  value,
  onChange,
}: {
  trips: TripOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const selected = trips.find((t) => t.id === value) ?? trips[0];

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

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  const list = (
    <div className="min-h-0 flex-1 overflow-y-auto py-1">
      {trips.map((t) => {
        const active = t.id === selected?.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-ocean-100 sm:py-2.5 ${
              active ? "bg-ocean-50" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ocean-900">
                {t.name}
              </div>
              {t.route && (
                <div className="truncate text-xs text-ocean-500">{t.route}</div>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold text-accent-500">
              {formatIDR(t.price_idr)}
            </span>
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
        <span className="min-w-0 flex-1 truncate font-medium">
          {selected?.name ?? "Select a route"}
        </span>
        {selected && (
          <span className="shrink-0 text-sm font-bold text-accent-500">
            {formatIDR(selected.price_idr)}
          </span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-ocean-500" />
      </button>

      {open &&
        (isMobile ? (
          <BottomSheet open onClose={() => setOpen(false)} title="Choose route">
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
