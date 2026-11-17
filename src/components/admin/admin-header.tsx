import Link from "next/link";
import { ShieldCheck, UserPlus } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

export async function AdminHeader({ title }: { title: string }) {
  const profile = await getSessionProfile();
  const userName = profile?.full_name ?? "İnzibatçı";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-md md:px-8">
      <div className="mx-auto max-w-[1536px]">
        <div className="flex h-20 items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <ShieldCheck className="size-3 text-indigo-400" />
                İnzibatçı Paneli
              </span>
            </div>
            <h1 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-950">{title}</h1>
          </div>

          <Link
            href="/admin/teachers/new"
            className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:bg-indigo-800 sm:flex"
          >
            <UserPlus className="size-4" />
            Yeni müəllim əlavə et
          </Link>

          <AdminUserMenu userName={userName} />
        </div>
      </div>
    </header>
  );
}
