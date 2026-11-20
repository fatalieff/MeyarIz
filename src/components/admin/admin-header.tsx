import Link from "next/link";
import { ShieldCheck, UserPlus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

export async function AdminHeader({ title }: { title: string }) {
  const profile = await getSessionProfile();
  const userName = profile?.full_name ?? "İnzibatçı";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6 md:px-8 transition-colors">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex h-16 md:h-[4.25rem] items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-purple-700">
                <ShieldCheck className="size-3 text-purple-600" />
                İnzibatçı
              </span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <h1 className="truncate text-base md:text-lg font-bold tracking-tight text-slate-900">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/teachers/new"
              className="hidden items-center gap-2 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-purple-700 active:bg-purple-800 sm:flex"
            >
              <UserPlus className="size-3.5" />
              <span>Yeni müəllim əlavə et</span>
            </Link>

            <div className="h-6 w-px bg-slate-200/80 mx-0.5" />

            <AdminUserMenu userName={userName} />
          </div>
        </div>
      </div>
    </header>
  );
}
