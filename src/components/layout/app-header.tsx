import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";
import { UserMenu } from "@/components/layout/user-menu";
import { NavigationLayoutMenu } from "@/components/layout/navigation-layout-menu";
import { HorizontalNavigation } from "@/components/layout/horizontal-navigation";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";
import { navigationHome, type NavigationRole } from "@/components/layout/navigation-config";

export async function AppHeader({
  title,
  role = "teacher",
}: {
  title: string;
  userName?: string;
  role?: "teacher" | "student";
}) {
  const profile = await getSessionProfile();
  const userName = profile?.full_name ?? (role === "teacher" ? "Müəllim" : "Şagird");
  const homeHref = navigationHome(role as NavigationRole);

  return (
    <header className="app-header sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6 md:px-8 transition-colors">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex h-16 md:h-[4.25rem] items-center justify-between gap-3">
          {/* Sol: Brend (Yalnız üfüqi rejimdə) və Səhifə Başlığı */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="navbar-brand-container shrink-0 items-center gap-3">
              <Link
                href={homeHref}
                aria-label="MeyarİZ ana səhifə"
                className="navbar-brand flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-1 transition hover:opacity-90"
              >
                <MeyarIzLogo size={32} />
                <MeyarIzWordmark className="navbar-brand-wordmark text-[18px] font-bold" />
              </Link>
              <div className="navbar-brand-divider h-5 w-px bg-slate-200" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  MeyarİZ
                </span>
                <span className="hidden text-slate-300 sm:inline">/</span>
                <h1 className="truncate text-base md:text-lg font-bold tracking-tight text-slate-900">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* Sağ: Fəaliyyətlər, Bildirişlər və İstifadəçi Menyu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NavigationLayoutMenu />

            {role === "teacher" && (
              <Link
                href="/dashboard/students?new=1"
                className="hidden items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:shadow-sm sm:flex"
              >
                <Plus className="size-3.5" />
                <span>Şagird əlavə et</span>
              </Link>
            )}

            {role === "student" && <NotificationCenter />}

            <div className="hidden lg:block h-6 w-px bg-slate-200/80 mx-0.5" />

            <UserMenu userName={userName} role={role} />
          </div>
        </div>

        <HorizontalNavigation role={role} />
      </div>
    </header>
  );
}
