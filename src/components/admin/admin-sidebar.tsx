"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
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
      <aside className="relative hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:z-40 lg:block">
        <div className="flex h-screen flex-col overflow-hidden px-4 py-5">
          <Link
            href="/admin"
            title="MeyarİZ İnzibatçı Paneli"
            className="mb-7 flex h-14 items-center gap-3 rounded-2xl px-2.5 py-2 transition hover:bg-slate-50"
          >
            <span className="shrink-0">
              <MeyarIzLogo size={40} />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <MeyarIzWordmark className="text-[19px] font-bold" />
                <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Admin
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">İdarəetmə Mərkəzi</span>
            </div>
          </Link>

          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
            İnzibatçı Menyu
          </div>

          <nav className="space-y-1.5">
            {adminNav.map(([href, label, Icon]) => {
              const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "group flex h-12 items-center gap-3 overflow-hidden rounded-xl px-2.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                      active
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-xs"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                  {active && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-indigo-500" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-5 text-slate-500">
            <strong className="block font-semibold text-slate-800">Təhlükəsiz İdarəetmə</strong>
            Müəllim workspace-ləri və ümumi statistik göstəricilər bu paneldən nəzarətdə saxlanılır.
          </div>
        </div>
      </aside>

      {/* Mobil naviqasiya */}
      <nav
        aria-label="Admin Mobil Naviqasiya"
        className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-md lg:hidden"
      >
        {adminNav.map(([href, label, Icon]) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[70px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors",
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("size-4", active && "text-indigo-600")} />
              <span className="max-w-16 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
