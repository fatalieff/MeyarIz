"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { IntentPrefetchLink } from "@/components/ui/intent-prefetch-link";
import {
  ChevronRight,
  Database,
  LayoutDashboard,
  Lock,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const adminNav = [
  ["/admin", "İcmal", LayoutDashboard],
  ["/admin/teachers", "Müəllimlər", Users],
  ["/admin/audit-logs", "Audit qeydləri", ShieldCheck],
  ["/admin/settings", "Tənzimləmələr", Settings],
] as const;

export function AdminSidebar() {
  const path = usePathname();

  return (
    <>
      <aside className="relative hidden h-screen w-72 shrink-0 lg:sticky lg:top-0 lg:z-40 lg:block">
        <div className="relative flex h-screen flex-col overflow-y-auto overflow-x-hidden border-r border-slate-800/80 bg-gradient-to-b from-[#0a0f1d] via-[#090d18] to-[#060810] px-4 py-4 text-white shadow-[8px_0_36px_-12px_rgba(2,6,23,0.85)] scrollbar-none">
          {/* Ambient Lighting Orbs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-gradient-to-tr from-sky-500/10 via-indigo-600/10 to-transparent blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
          />

          {/* Premium Brand Header */}
          <Link
            href="/admin"
            title="MeyarİZ İnzibatçı Paneli"
            className="group relative mb-5 flex h-[4.25rem] items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-purple-400/30 hover:bg-white/[0.05] hover:shadow-[0_8px_24px_-6px_rgba(168,85,247,0.2)]"
          >
            <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 p-1 ring-1 ring-white/15 shadow-md transition-transform duration-300 group-hover:scale-105">
              <MeyarIzLogo size={36} className="border-0 shadow-none" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 rounded-xl bg-purple-500/20 blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <MeyarIzWordmark className="text-[19px] font-bold tracking-tight text-white" />
                <span className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  Admin
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                Sistem İnzibatçısı
              </p>
            </div>
          </Link>

          {/* Bölmə Başlığı */}
          <div className="px-2.5 pb-1.5 pt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
            <span>İnzibatçı Menyu</span>
            <div className="h-px w-10 bg-slate-800" />
          </div>

          {/* Menyu Naviqasiyası */}
          <nav className="relative space-y-1">
            {adminNav.map(([href, label, Icon]) => {
              const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
              return (
                <IntentPrefetchLink
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "focus-ring group relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-2.5 text-[13.5px] font-medium transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-purple-500/20 via-indigo-500/10 to-transparent font-semibold text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35),0_4px_20px_-4px_rgba(168,85,247,0.3)]"
                      : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100 hover:translate-x-0.5"
                  )}
                >
                  {/* Sol Neon Xətt */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-gradient-to-b from-sky-400 via-purple-400 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                    />
                  )}

                  {/* İkon */}
                  <span
                    className={cn(
                      "relative grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-200",
                      active
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(168,85,247,0.5)] ring-1 ring-white/20"
                        : "bg-white/[0.035] text-slate-400 ring-1 ring-white/[0.06] group-hover:bg-white/[0.08] group-hover:text-purple-300 group-hover:ring-purple-400/20"
                    )}
                  >
                    <Icon className="size-[17px]" strokeWidth={active ? 2.3 : 1.9} />
                  </span>

                  <span className="whitespace-nowrap">{label}</span>

                  {/* Sağ İndikator */}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="ml-auto mr-1 flex size-5 shrink-0 items-center justify-center"
                    >
                      <span className="size-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc]" />
                    </span>
                  ) : (
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto mr-0.5 size-3.5 shrink-0 text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-70 group-hover:translate-x-0.5"
                    />
                  )}
                </IntentPrefetchLink>
              );
            })}
          </nav>

          {/* Premium Admin Status Card */}
          <div className="relative mt-auto pt-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-purple-950/20 to-transparent p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-purple-500/20 blur-xl"
              />

              <div className="relative flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-300">
                    Qorunan Zona
                  </span>
                </div>
                <Lock className="size-3.5 text-purple-400/80" />
              </div>

              <div className="relative">
                <p className="text-xs font-semibold tracking-tight text-slate-100">
                  Təhlükəsiz İdarəetmə
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                  Bütün müəllim məlumatları və loqlar şifrələnmiş şəkildə qorunur.
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <Database className="size-3 text-purple-400" />
                  Audit Aktiv
                </span>
                <span className="font-mono text-[9.5px]">Admin Core</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobil naviqasiya */}
      <nav
        aria-label="Admin Mobil Naviqasiya"
        className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.12] bg-[#090d18]/90 p-1.5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] backdrop-blur-2xl scrollbar-none lg:hidden"
      >
        {adminNav.map(([href, label, Icon]) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <IntentPrefetchLink
              key={href}
              href={href}
              className={cn(
                "focus-ring relative flex min-w-[70px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-all duration-200",
                active
                  ? "bg-gradient-to-b from-purple-500/25 to-purple-600/10 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.4)]"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              <div
                className={cn(
                  "grid size-7 place-items-center rounded-lg transition-colors",
                  active
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    : "text-slate-400"
                )}
              >
                <Icon className="size-4" strokeWidth={active ? 2.4 : 1.9} />
              </div>
              <span className="max-w-16 truncate">{label}</span>
              {active && (
                <span className="absolute bottom-1 size-1 rounded-full bg-purple-300 shadow-[0_0_6px_#c084fc]" />
              )}
            </IntentPrefetchLink>
          );
        })}
      </nav>
    </>
  );
}
