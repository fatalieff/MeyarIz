"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { IntentPrefetchLink } from "@/components/ui/intent-prefetch-link";
import {
  LayoutDashboard,
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
      {/* Desktop & Tablet Sidebar */}
      <aside className="relative hidden h-screen w-72 shrink-0 lg:sticky lg:top-0 lg:z-40 lg:block">
        <div className="relative flex h-screen flex-col overflow-y-auto overflow-x-hidden border-r border-slate-800/80 bg-[#090d16] px-4 py-5 text-white scrollbar-none">
          
          {/* Təmiz Seamless Brend Sahəsi (Kartsız) */}
          <div className="mb-6 px-1.5 pt-1">
            <Link
              href="/admin"
              title="MeyarİZ İnzibatçı Paneli"
              className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <MeyarIzLogo size={32} className="border-0 shadow-none" />
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <MeyarIzWordmark className="text-[18px] font-bold tracking-tight text-white" />
                  <span className="inline-block size-1 rounded-full bg-purple-400" />
                  <span className="text-[11px] font-medium tracking-wide text-purple-300">
                    Admin
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  İnzibatçı İdarəetmə Mərkəzi
                </p>
              </div>
            </Link>
          </div>

          {/* Bölmə Başlığı */}
          <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            İnzibatçı Menyu
          </div>

          {/* Menyu Naviqasiyası */}
          <nav className="relative flex-1 space-y-0.5">
            {adminNav.map(([href, label, Icon]) => {
              const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
              return (
                <IntentPrefetchLink
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "focus-ring group relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-[13.5px] font-medium transition-all duration-150",
                    active
                      ? "bg-purple-600/15 font-semibold text-white shadow-xs"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                  )}
                >
                  {/* Aktiv göstərici zolağı */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    />
                  )}

                  {/* İkon */}
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0 transition-colors duration-150",
                      active
                        ? "text-purple-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <span className="whitespace-nowrap">{label}</span>

                  {/* Aktiv nöqtə */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="ml-auto size-1.5 rounded-full bg-purple-400"
                    />
                  )}
                </IntentPrefetchLink>
              );
            })}
          </nav>

          {/* Kartsız, Zərif Seamless Footer */}
          <div className="mt-auto border-t border-slate-800/80 px-2 pt-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                MeyarİZ Core
              </span>
              <span className="font-mono text-[10px] text-slate-400">Təhlükəsiz</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobil naviqasiya */}
      <nav
        aria-label="Admin Mobil Naviqasiya"
        className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.12] bg-[#090d16]/95 p-1.5 shadow-2xl backdrop-blur-2xl scrollbar-none lg:hidden"
      >
        {adminNav.map(([href, label, Icon]) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <IntentPrefetchLink
              key={href}
              href={href}
              className={cn(
                "focus-ring relative flex min-w-[68px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-all duration-150",
                active
                  ? "bg-purple-600/20 text-white"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              <Icon
                className={cn("size-4", active ? "text-purple-400" : "text-slate-400")}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span className="max-w-16 truncate">{label}</span>
              {active && (
                <span className="absolute bottom-1 size-1 rounded-full bg-purple-400" />
              )}
            </IntentPrefetchLink>
          );
        })}
      </nav>
    </>
  );
}
