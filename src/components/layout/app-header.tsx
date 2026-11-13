import Link from "next/link";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/session";

// userName is accepted for backward-compatibility but ignored; the name is
// always read from the active session inside this component.
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
  const initial = userName.trim().slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-4 border-b bg-white/85 px-5 backdrop-blur-xl md:px-8">
      <button aria-label="Menyunu aç" className="lg:hidden">
        <Menu />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-indigo-500">MathRank</p>
        <h1 className="truncate text-lg font-bold text-slate-900">{title}</h1>
      </div>
      {role === "teacher" && (
        <Link
          href="/dashboard/students?new=1"
          className="hidden items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 sm:flex"
        >
          <Plus className="size-4" />
          Şagird əlavə et
        </Link>
      )}
      <button aria-label="Axtar" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
        <Search className="size-5" />
      </button>
      <button aria-label="Bildirişlər" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
        <Bell className="size-5" />
      </button>
      <div className="hidden items-center gap-3 border-l pl-4 sm:flex">
        <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 font-bold text-indigo-700">
          {initial}
        </div>
        <div className="text-sm">
          <strong className="block text-slate-800">{userName}</strong>
          <span className="text-xs text-slate-500">{role === "teacher" ? "Müəllim" : "Şagird"}</span>
        </div>
      </div>
    </header>
  );
}
