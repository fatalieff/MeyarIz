"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { IntentPrefetchLink } from "@/components/ui/intent-prefetch-link";
import { LayoutDashboard, Users, ShieldCheck, Settings } from "lucide-react";

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
        <div className="relative flex h-screen flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#0b1020_0%,#111831_52%,#0a0f1e_100%)] px-4 py-5 text-white shadow-[10px_0_40px_-28px_rgba(15,23,42,.9)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 size-56 rounded-full bg-violet-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 size-52 rounded-full bg-sky-500/10 blur-3xl" />
          <Link
            href="/admin"
            title="MeyarİZ İnzibatçı Paneli"
            className="relative mb-6 flex h-16 items-center gap-3 rounded-2xl border border-white/8 bg-white/[.045] px-2.5 py-2 transition hover:border-white/15 hover:bg-white/[.075]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white shadow-[0_8px_22px_rgba(0,0,0,.25)]">
              <MeyarIzLogo size={38} className="border-0" />
            </span>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <MeyarIzWordmark className="text-[19px] font-bold text-white" />
                <span className="rounded-md border border-indigo-300/20 bg-indigo-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                  Admin
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-indigo-300">İdarəetmə mərkəzi</span>
            </div>
          </Link>

          <div className="relative mb-3 px-3 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">
            İnzibatçı menyu
          </div>

          <nav className="relative space-y-1">
            {adminNav.map(([href, label, Icon]) => {
              const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
              return (
                <IntentPrefetchLink
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "focus-ring group relative flex h-12 items-center gap-3 overflow-hidden rounded-xl px-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-white/[.105] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_8px_22px_rgba(0,0,0,.12)]"
                      : "text-slate-400 hover:bg-white/[.055] hover:text-white"
                  )}
                >
                  {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-sky-400 to-indigo-400" />}
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-[10px] transition-all",
                      active
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_7px_18px_rgba(79,70,229,.32)]"
                        : "bg-white/[.055] text-slate-500 group-hover:bg-white/[.1] group-hover:text-indigo-300"
                    )}
                  >
                    <Icon className="size-[17px]" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                  {active && <span className="ml-auto mr-1 size-1.5 shrink-0 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,.85)]" />}
                </IntentPrefetchLink>
              );
            })}
          </nav>

          <div className="relative mt-auto rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-indigo-500/15 to-sky-400/5 p-3.5 text-xs leading-5 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
            <div className="mb-2 flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" /><span className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-300">Qorunan sahə</span></div>
            <strong className="block font-semibold text-slate-100">Təhlükəsiz idarəetmə</strong>
            Müəllim workspace-ləri və ümumi statistik göstəricilər bu paneldən nəzarətdə saxlanılır.
          </div>
        </div>
      </aside>

      {/* Mobil naviqasiya */}
      <nav
        aria-label="Admin Mobil Naviqasiya"
        className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-slate-950/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,.28)] backdrop-blur-xl lg:hidden"
      >
        {adminNav.map(([href, label, Icon]) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <IntentPrefetchLink
              key={href}
              href={href}
              className={cn(
                "focus-ring flex min-w-[72px] flex-1 flex-col items-center gap-1.5 rounded-[.9rem] px-2 py-2 text-[10px] font-semibold transition-all",
                active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <Icon className={cn("size-4", active && "text-indigo-600")} strokeWidth={active ? 2.5 : 2} />
              <span className="max-w-16 truncate">{label}</span>
            </IntentPrefetchLink>
          );
        })}
      </nav>
    </>
  );
}
