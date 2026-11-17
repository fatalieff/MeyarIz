"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { isNavigationActive, navigationFor, navigationHome, type NavigationRole } from "@/components/layout/navigation-config";

export function Sidebar({ role="teacher" }: { role?: NavigationRole }) {
  const path=usePathname();
  const nav=navigationFor(role);
  return <>
    <aside className="app-sidebar relative hidden h-screen shrink-0 lg:sticky lg:top-0 lg:z-50 lg:block">
      <div className="app-sidebar-panel flex h-screen flex-col overflow-hidden border-r border-slate-200 bg-white px-3.5 py-5">
        <Link
          href={navigationHome(role)}
          title="MeyarİZ Ana Səhifə"
          className="mb-7 flex h-14 items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-50"
        >
          <span className="grid size-11 shrink-0 place-items-center">
            <MeyarIzLogo size={40}/>
          </span>
          <span className="sidebar-label overflow-hidden">
            <MeyarIzWordmark className="whitespace-nowrap text-[20px]"/>
          </span>
        </Link>
        <div className="sidebar-label mb-3 overflow-hidden px-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
          <span className="whitespace-nowrap">Menyu</span>
        </div>
        <nav className="space-y-1.5">
          {nav.map(([href,label,Icon])=>{
            const active=isNavigationActive(path,href);
            return <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "group flex h-12 items-center gap-3 overflow-hidden rounded-xl px-2 text-sm font-medium transition-colors duration-150",
                active?"bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-100":"text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className={cn(
                "grid size-11 shrink-0 place-items-center rounded-lg transition-colors",
                active?"bg-indigo-600 text-white shadow-xs":"bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-xs"
              )}>
                <Icon className="size-4"/>
              </span>
              <span className="sidebar-label whitespace-nowrap overflow-hidden">{label}</span>
              {active&&<span className="sidebar-label ml-auto size-1.5 shrink-0 rounded-full bg-indigo-500"/>}
            </Link>;
          })}
        </nav>
        <div className="sidebar-label mt-auto overflow-hidden">
          <div className="min-w-[230px] rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            <strong className="block text-slate-700">Hər nəticənin bir izi var</strong>
            {role==="teacher"?"Tədris prosesini bir yerdən idarə edin.":"Nəticələrinizi və inkişafınızı izləyin."}
          </div>
        </div>
      </div>
    </aside>
    <nav aria-label="Mobil naviqasiya" className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-md lg:hidden">
      {nav.map(([href,label,Icon])=>{
        const active=isNavigationActive(path,href);
        return <Link key={href} href={href} className={cn("flex min-w-[70px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors",active?"bg-indigo-50 text-indigo-700":"text-slate-500 hover:bg-slate-50")}><Icon className={cn("size-4",active&&"text-indigo-600")}/><span className="max-w-16 truncate">{label}</span></Link>;
      })}
    </nav>
  </>;
}
