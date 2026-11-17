import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";
import { UserMenu } from "@/components/layout/user-menu";

export async function AppHeader({title,role="teacher"}:{title:string;userName?:string;role?:"teacher"|"student"}){
  const profile=await getSessionProfile();
  const userName=profile?.full_name??(role==="teacher"?"Müəllim":"Şagird");
  return <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 px-5 backdrop-blur-2xl md:px-8">
    <div className="mx-auto flex h-20 max-w-[1536px] items-center gap-4">
      <Link href={role==="teacher"?"/dashboard":"/student/dashboard"} aria-label="MathRank ana səhifə" className="relative block size-10 shrink-0 overflow-hidden rounded-2xl bg-black shadow-lg lg:hidden"><Image src="/mathrank-logo.png" alt="" fill sizes="40px" className="object-cover"/></Link>
      <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-indigo-500">MathRank workspace</p><h1 className="mt-0.5 truncate text-lg font-bold tracking-[-.025em] text-slate-950">{title}</h1></div>
      {role==="teacher"&&<Link href="/dashboard/students?new=1" className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,.25)] transition hover:-translate-y-0.5 sm:flex"><Plus className="size-4"/>Şagird əlavə et</Link>}
      <UserMenu userName={userName} role={role}/>
    </div>
  </header>;
}
