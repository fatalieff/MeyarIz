"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

export function CustomSelect({
  name,
  options,
  placeholder = "Seçin",
  defaultValue = "",
  ariaLabel,
  className,
  required = false,
  onValueChange,
}: {
  name?: string;
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  ariaLabel: string;
  className?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        data-required={required || undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        className={cn(
          "focus-ring flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 text-left text-sm font-medium outline-none transition",
          open ? "border-indigo-400 ring-4 ring-indigo-500/10" : "hover:border-slate-300",
          selected ? "text-slate-800" : "text-slate-400",
        )}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-180 text-indigo-500")} />
      </button>

      {open && (
        <div id={listboxId} role="listbox" aria-label={ariaLabel} className="absolute z-50 mt-2 max-h-60 w-full min-w-[10rem] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,.16)] ring-1 ring-slate-900/5">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { setValue(option.value); onValueChange?.(option.value); setOpen(false); }}
                className={cn("flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition", active ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-700 hover:bg-slate-50")}
              >
                <span>{option.label}</span>
                {active && <Check className="size-4 shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
