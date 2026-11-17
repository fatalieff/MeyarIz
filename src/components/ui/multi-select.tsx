"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/ui/custom-select";

export function MultiSelect({
  name,
  options,
  placeholder = "Seçin",
  ariaLabel,
  onValueChange,
}: {
  name: string;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel: string;
  onValueChange?: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.filter((option) => values.includes(option.value));

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const commit = (next: string[]) => {
    setValues(next);
    onValueChange?.(next);
  };

  const toggle = (value: string) => commit(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return (
    <div ref={rootRef} className="relative">
      {values.map((value) => <input key={value} type="hidden" name={name} value={value} />)}
      <button type="button" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listboxId} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} className={cn("focus-ring flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-left text-sm outline-none transition", open ? "border-indigo-400 ring-4 ring-indigo-500/10" : "hover:border-slate-300")}>
        <span className={cn("min-w-0 flex-1", selected.length ? "text-slate-800" : "text-slate-400")}>
          {selected.length ? <span className="flex flex-wrap gap-1.5">{selected.slice(0, 3).map((option) => <span key={option.value} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{option.label}<span role="button" tabIndex={0} aria-label={`${option.label} seçimini sil`} onClick={(event) => { event.stopPropagation(); toggle(option.value); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); toggle(option.value); } }}><X className="size-3" /></span></span>)}{selected.length > 3 && <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">+{selected.length - 3}</span>}</span> : placeholder}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180 text-indigo-500")} />
      </button>

      {open && <div id={listboxId} role="listbox" aria-label={ariaLabel} aria-multiselectable="true" className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,.16)] ring-1 ring-slate-900/5">
        <div className="mb-1 flex items-center justify-between px-2 py-1.5"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Qrupları seçin</span>{values.length > 0 && <button type="button" onClick={() => commit([])} className="text-xs font-semibold text-rose-500 hover:text-rose-700">Təmizlə</button>}</div>
        {options.map((option) => { const active = values.includes(option.value); return <button key={option.value} type="button" role="option" aria-selected={active} onClick={() => toggle(option.value)} className={cn("flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition", active ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-700 hover:bg-slate-50")}><span>{option.label}</span><span className={cn("grid size-5 place-items-center rounded-md border transition", active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent")}><Check className="size-3.5" strokeWidth={3} /></span></button>; })}
      </div>}
    </div>
  );
}
