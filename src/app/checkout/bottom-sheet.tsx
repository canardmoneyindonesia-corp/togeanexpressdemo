"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/** Mobile bottom sheet: backdrop + panel that slides up from the bottom. */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-sheet-up flex-col rounded-t-2xl bg-white shadow-2xl">
        {/* drag handle */}
        <div className="flex justify-center pt-2.5">
          <span className="h-1.5 w-10 rounded-full bg-ocean-200" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2 pt-1.5">
          <h3 className="text-base font-bold text-ocean-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ocean-500 hover:bg-ocean-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>
  );
}
