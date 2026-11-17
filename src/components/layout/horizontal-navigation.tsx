"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavigationActive, navigationFor, type NavigationRole } from "@/components/layout/navigation-config";

export function HorizontalNavigation({ role }: { role: NavigationRole }) {
  const path=usePathname();
  return <nav aria-label="Əsas naviqasiya" className="horizontal-navigation hidden items-center gap-1 overflow-x-auto border-t border-slate-100 py-2">
    {navigationFor(role).map(([href,label,Icon])=>{const active=isNavigationActive(path,href);return <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",active?"bg-indigo-50 text-indigo-700":"text-slate-600 hover:bg-slate-50 hover:text-slate-900")}><Icon className={cn("size-4",active?"text-indigo-600":"text-slate-400")}/>{label}</Link>;})}
  </nav>;
}
