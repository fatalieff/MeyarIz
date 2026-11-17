"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const weekDays = ["Be", "Ça", "Ç", "Ca", "C", "Ş", "B"];

const toValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};

export function DatePicker({ name, defaultValue = "", ariaLabel }: { name: string; defaultValue?: string; ariaLabel: string }) {
  const initial = fromValue(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(initial || new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = fromValue(value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const choose = (day: number) => {
    setValue(toValue(new Date(view.getFullYear(), view.getMonth(), day)));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button type="button" aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((current) => !current)} className={cn("focus-ring flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm font-medium outline-none transition", open ? "border-indigo-400 ring-4 ring-indigo-500/10" : "hover:border-slate-300", selected ? "text-slate-800" : "text-slate-400")}>
        <span>{selected ? `${selected.getDate()} ${monthNames[selected.getMonth()].toLowerCase()} ${selected.getFullYear()}` : "Tarix seçin"}</span>
        <CalendarDays className={cn("size-4", open ? "text-indigo-600" : "text-slate-400")} />
      </button>

      {open && (
        <div role="dialog" aria-label="Tarix seçimi" className="absolute left-0 z-50 mt-2 w-[19rem] max-w-[calc(100vw-3rem)] rounded-[1.4rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between px-1 pb-3">
            <button type="button" aria-label="Əvvəlki ay" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><ChevronLeft className="size-4" /></button>
            <strong className="text-sm text-slate-900">{monthNames[view.getMonth()]} {view.getFullYear()}</strong>
            <button type="button" aria-label="Növbəti ay" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><ChevronRight className="size-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => <span key={day} className="grid h-8 place-items-center text-[10px] font-bold uppercase text-slate-400">{day}</span>)}
            {cells.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} className="size-9" />;
              const current = new Date(view.getFullYear(), view.getMonth(), day);
              const active = value === toValue(current);
              const today = toValue(current) === toValue(new Date());
              return <button key={day} type="button" onClick={() => choose(day)} className={cn("grid size-9 place-items-center rounded-xl text-sm font-medium transition", active ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25" : today ? "bg-indigo-50 font-bold text-indigo-700" : "text-slate-700 hover:bg-slate-100")}>{day}</button>;
            })}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3 text-center"><button type="button" onClick={() => { const today = new Date(); setView(today); setValue(toValue(today)); setOpen(false); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50">Bu günü seç</button></div>
        </div>
      )}
    </div>
  );
}
