"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3,CalendarDays,ClipboardCheck,GraduationCap,LayoutDashboard,Medal,Settings,Users,Sigma,Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const teacherNav=[
  ["/dashboard","İdarəetmə paneli",LayoutDashboard],["/dashboard/groups","Qruplar",GraduationCap],["/dashboard/students","Şagirdlər",Users],["/dashboard/schedule","Dərs cədvəli",CalendarDays],["/dashboard/exams","Sınaqlar",ClipboardCheck],["/dashboard/rankings","Ümumi reytinq",Medal],["/dashboard/analytics","Analitika",BarChart3],["/dashboard/settings","Tənzimləmələr",Settings]
] as const;
const studentNav=[["/student/dashboard","Ana səhifə",LayoutDashboard],["/student/results","Nəticələr",ClipboardCheck],["/student/leaderboard","Reytinq",Medal],["/student/schedule","Cədvəl",CalendarDays],["/student/achievements","Nailiyyətlər",Sigma],["/student/profile","Profil",Users]] as const;

export function Sidebar({role="teacher"}:{role?:"teacher"|"student"}){
  const path=usePathname();
  const nav=role==="teacher"?teacherNav:studentNav;
  const isActive=(href:string)=>href.endsWith("dashboard")?path===href:path.startsWith(href);
  return <>
    <aside className="relative hidden h-screen w-[292px] shrink-0 overflow-hidden border-r border-white/8 bg-[#0b1020] px-4 py-5 text-white lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-indigo-600/20 blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-32 -right-28 size-72 rounded-full bg-cyan-500/10 blur-3xl"/>
      <Link href={role==="teacher"?"/dashboard":"/student/dashboard"} className="relative mb-7 flex items-center gap-3 rounded-2xl px-3 py-2">
        <span className="relative block size-11 overflow-hidden rounded-2xl bg-black shadow-[0_12px_30px_rgba(79,70,229,.25)] ring-1 ring-white/10"><Image src="/mathrank-logo.png" alt="" fill sizes="44px" className="object-cover"/></span>
        <span><strong className="block text-[19px] tracking-[-.03em]">MathRank</strong><small className="flex items-center gap-1 text-[10px] uppercase tracking-[.2em] text-slate-400"><Sparkles className="size-2.5"/>ağıllı inkişaf</small></span>
      </Link>
      <div className="relative mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Menyu</div>
      <nav className="relative space-y-1.5">{nav.map(([href,label,Icon])=><Link key={href} href={href} className={cn("group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-slate-400 transition duration-200 hover:bg-white/[.06] hover:text-white",isActive(href)&&"bg-gradient-to-r from-indigo-500/25 to-violet-500/10 text-white shadow-[inset_0_0_0_1px_rgba(129,140,248,.18)]")}><span className={cn("grid size-8 place-items-center rounded-xl transition",isActive(href)?"bg-indigo-500 text-white shadow-lg shadow-indigo-950/40":"bg-white/[.04] text-slate-400 group-hover:bg-white/[.08] group-hover:text-white")}><Icon className="size-4"/></span>{label}{isActive(href)&&<span className="ml-auto size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]"/>}</Link>)}</nav>
    </aside>
    <nav className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-[1.35rem] border border-white/80 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,23,42,.18)] backdrop-blur-xl lg:hidden">{nav.map(([href,label,Icon])=><Link key={href} href={href} className={cn("flex min-w-[70px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold text-slate-500",isActive(href)&&"bg-slate-950 text-white shadow-lg")}><Icon className="size-4"/><span className="max-w-16 truncate">{label}</span></Link>)}</nav>
  </>;
}
