import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";
import { UserMenu } from "@/components/layout/user-menu";
import { NavigationLayoutMenu } from "@/components/layout/navigation-layout-menu";
import { HorizontalNavigation } from "@/components/layout/horizontal-navigation";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { navigationHome, type NavigationRole } from "@/components/layout/navigation-config";

export async function AppHeader({title,role="teacher"}:{title:string;userName?:string;role?:"teacher"|"student"}){
  const profile=await getSessionProfile();
  const userName=profile?.full_name??(role==="teacher"?"Müəllim":"Şagird");
  const homeHref=navigationHome(role as NavigationRole);
  return <header className="app-header sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-md md:px-8">
    <div className="mx-auto max-w-[1536px]">
    <div className="flex h-20 items-center gap-4">
      <div className="navbar-brand-container shrink-0 items-center gap-3">
        <Link
          href={homeHref}
          aria-label="MeyarİZ ana səhifə"
          className="navbar-brand flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-1 transition hover:opacity-90"
        >
          <MeyarIzLogo size={36}/>
          <MeyarIzWordmark className="navbar-brand-wordmark text-[19px] font-bold"/>
        </Link>
        <div className="navbar-brand-divider h-6 w-px bg-slate-200"/>
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-[-.025em] text-slate-950">{title}</h1>
      </div>
      <NavigationLayoutMenu/>
      {role==="teacher"&&<Link href="/dashboard/students?new=1" className="hidden items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors sm:flex"><Plus className="size-4"/>Şagird əlavə et</Link>}
      {role==="student"&&<NotificationCenter/>}
      <UserMenu userName={userName} role={role}/>
    </div>
    <HorizontalNavigation role={role}/>
    </div>
  </header>;
}
