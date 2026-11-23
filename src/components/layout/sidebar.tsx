"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { IntentPrefetchLink } from "@/components/ui/intent-prefetch-link";
import {
  isNavigationActive,
  navigationFor,
  navigationHome,
  type NavigationRole,
} from "@/components/layout/navigation-config";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Medal,
  Settings,
  Sigma,
  Users,
  WalletCards,
} from "lucide-react";

interface NavSection {
  title: string;
  items: readonly (readonly [string, string, any])[];
}

const teacherSections: NavSection[] = [
  {
    title: "İdarəetmə",
    items: [
      ["/dashboard", "İdarəetmə paneli", LayoutDashboard],
      ["/dashboard/groups", "Qruplar", GraduationCap],
      ["/dashboard/students", "Şagirdlər", Users],
    ],
  },
  {
    title: "Tədris & Sınaq",
    items: [
      ["/dashboard/schedule", "Dərs cədvəli", CalendarDays],
      ["/dashboard/exams", "Sınaqlar", ClipboardCheck],
    ],
  },
  {
    title: "Maliyyə",
    items: [
      ["/dashboard/payments", "Ödənişlər", WalletCards],
    ],
  },
  {
    title: "Nəticələr",
    items: [
      ["/dashboard/rankings", "Ümumi reytinq", Medal],
      ["/dashboard/analytics", "Analitika", BarChart3],
      ["/dashboard/settings", "Tənzimləmələr", Settings],
    ],
  },
];

const studentSections: NavSection[] = [
  {
    title: "Tədris",
    items: [
      ["/student/dashboard", "Ana səhifə", LayoutDashboard],
      ["/student/results", "Nəticələr", ClipboardCheck],
      ["/student/leaderboard", "Reytinq", Medal],
    ],
  },
  {
    title: "Kabinet",
    items: [
      ["/student/schedule", "Cədvəl", CalendarDays],
      ["/student/achievements", "Nailiyyətlər", Sigma],
      ["/student/profile", "Profil", Users],
    ],
  },
];

export function Sidebar({ role = "teacher" }: { role?: NavigationRole }) {
  const path = usePathname();
  const nav = navigationFor(role);
  const sections = role === "teacher" ? teacherSections : studentSections;
  const roleLabel = role === "teacher" ? "Müəllim" : "Şagird";

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="app-sidebar relative hidden h-screen shrink-0 lg:sticky lg:top-0 lg:z-50 lg:block">
        <div className="app-sidebar-panel relative flex h-screen flex-col overflow-y-auto overflow-x-hidden border-r border-slate-800/80 bg-[#090d16] px-3.5 py-5 text-white scrollbar-none">
          
          {/* Təmiz Seamless Brend Sahəsi (Kartsız, Minimalist) */}
          <div className="mb-6 px-1.5 pt-1">
            <Link
              href={navigationHome(role)}
              title="MeyarİZ Ana Səhifə"
              className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <MeyarIzLogo size={32} className="border-0 shadow-none" />
              </span>
              <span className="sidebar-label min-w-0 overflow-hidden">
                <span className="flex items-center gap-2">
                  <MeyarIzWordmark className="block whitespace-nowrap text-[18px] font-bold tracking-tight text-white" />
                  <span className="inline-block size-1 rounded-full bg-indigo-400" />
                  <span className="text-[11px] font-medium tracking-wide text-indigo-300">
                    {roleLabel}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                  {role === "teacher" ? "Tədris İdarəetmə Paneli" : "Şagird Şəxsi Kabineti"}
                </span>
              </span>
            </Link>
          </div>

          {/* Naviqasiya Menyusu */}
          <nav className="relative flex-1 space-y-5">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Bölmə Başlığı */}
                <div className="sidebar-label px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  {section.title}
                </div>

                {/* Menyu Elementləri */}
                <div className="space-y-0.5">
                  {section.items.map(([href, label, Icon]) => {
                    const active = isNavigationActive(path, href);
                    return (
                      <IntentPrefetchLink
                        key={href}
                        href={href}
                        title={label}
                        className={cn(
                          "focus-ring group relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-[13.5px] font-medium transition-all duration-150",
                          active
                            ? "bg-indigo-600/15 font-semibold text-white shadow-xs"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                        )}
                      >
                        {/* Aktiv göstərici zolağı */}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                          />
                        )}

                        {/* İkon */}
                        <Icon
                          className={cn(
                            "size-[18px] shrink-0 transition-colors duration-150",
                            active
                              ? "text-indigo-400"
                              : "text-slate-400 group-hover:text-slate-200"
                          )}
                          strokeWidth={active ? 2.2 : 1.8}
                        />

                        {/* Yazı */}
                        <span className="sidebar-label whitespace-nowrap overflow-hidden">
                          {label}
                        </span>

                        {/* Aktiv olanda sağdakı incə nöqtə */}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="sidebar-label ml-auto size-1.5 rounded-full bg-indigo-400"
                          />
                        )}
                      </IntentPrefetchLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Kartsız, Zərif Seamless Footer */}
          <div className="sidebar-label mt-auto border-t border-slate-800/80 px-2 pt-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                MeyarİZ v2.4
              </span>
              <span className="font-mono text-[10px] text-slate-400">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobil Alt Zolaq */}
      <nav
        aria-label="Mobil naviqasiya"
        className={cn(
          "fixed inset-x-3 z-50 items-center gap-1 rounded-2xl border border-white/[0.12] bg-[#090d16]/95 p-1.5 shadow-2xl backdrop-blur-2xl lg:hidden",
          role === "student" ? "grid grid-cols-6" : "flex overflow-x-auto scrollbar-none",
        )}
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {nav.map(([href, label, Icon]) => {
          const active = isNavigationActive(path, href);
          return (
            <IntentPrefetchLink
              key={href}
              href={href}
              className={cn(
                "focus-ring relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-all duration-150",
                role === "student" ? "min-w-0 px-1" : "min-w-[68px] px-2",
                active
                  ? "bg-indigo-600/20 text-white"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              <Icon
                className={cn("size-4", active ? "text-indigo-400" : "text-slate-400")}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span className="w-full truncate text-center">{label}</span>
              {active && (
                <span className="absolute bottom-1 size-1 rounded-full bg-indigo-400" />
              )}
            </IntentPrefetchLink>
          );
        })}
      </nav>
    </>
  );
}
