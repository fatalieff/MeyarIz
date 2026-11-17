"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function AdminUserMenu({ userName = "İnzibatçı" }: { userName?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-slate-900 text-white font-bold text-xs">
          A
        </span>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-bold leading-none text-slate-900">{userName}</p>
          <p className="mt-1 text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">İnzibatçı</p>
        </div>
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="text-xs font-bold text-slate-900">{userName}</p>
            <p className="text-[11px] text-slate-500">Sistem İnzibatçısı</p>
          </div>
          <div className="mt-1 space-y-0.5">
            <button
              disabled={pending}
              onClick={() => startTransition(async () => { await logout(); })}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <LogOut className="size-4" />
              {pending ? "Çıxılır..." : "Çıxış et"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
