import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";
import { UserMenu } from "@/components/layout/user-menu";
import { MeyarIzLogo } from "@/components/ui/meyariz-logo";
import { NavigationLayoutMenu } from "@/components/layout/navigation-layout-menu";
import { HorizontalNavigation } from "@/components/layout/horizontal-navigation";
import { NotificationCenter } from "@/components/notifications/notification-center";

export async function AppHeader({title,role="teacher"}:{title:string;userName?:string;role?:"teacher"|"student"}){
  const profile=await getSessionProfile();
  const userName=profile?.full_name??(role==="teacher"?"Müəllim":"Şagird");
  return <header className="app-header sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-md md:px-8">
    <div className="mx-auto max-w-[1536px]">
    <div className="flex h-20 items-center gap-4">
      <Link href={role==="teacher"?"/dashboard":"/student/dashboard"} aria-label="MeyarİZ ana səhifə" className="shrink-0 lg:hidden"><MeyarIzLogo size={38} /></Link>
      <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-600">MeyarİZ</p><h1 className="mt-0.5 truncate text-lg font-bold tracking-[-.025em] text-slate-950">{title}</h1></div>
      <NavigationLayoutMenu/>
      {role==="teacher"&&<Link href="/dashboard/students?new=1" className="hidden items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors sm:flex"><Plus className="size-4"/>Şagird əlavə et</Link>}
      {role==="student"&&<NotificationCenter/>}
      <UserMenu userName={userName} role={role}/>
    </div>
    <HorizontalNavigation role={role}/>
    </div>
  </header>;
}
