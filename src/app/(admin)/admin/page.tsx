import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminOverview } from "@/lib/queries/admin";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  ShieldCheck,
  Layers,
  ArrowRight,
  UserPlus,
  History,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const { stats, recentTeachers, recentAuditLogs } = await getAdminOverview();

  return (
    <>
      <AdminHeader title="İnzibatçı İcmalı" />
      <main className="px-5 py-8 md:px-8">
        {/* Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <ShieldCheck className="size-3.5" /> Sistem İdarəetmə Paneli
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
              MeyarİZ Platformasının Ümumi Göstəriciləri
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bütün müəllimlərin iş sahələri təcrid olunmuş şəkildə qorunur. Şəxsi məlumatlar inzibatçıya qapalıdır.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href="/admin/teachers/new"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <UserPlus className="size-4" /> Yeni müəllim yarat
            </Link>
            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <History className="size-4" /> Audit Jurnalı
            </Link>
          </div>
        </div>

        {/* Statistik Kartlar (Yalnız ümumi saylar) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ümumi Müəllimlər</span>
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="size-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950">{stats.totalTeachers}</span>
              <span className="text-xs text-slate-500">hesab</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{stats.activeTeachers} aktiv</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{stats.suspendedTeachers} dayandırılmış</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">İş Sahələri (Workspace)</span>
              <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <Layers className="size-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950">{stats.totalWorkspaces}</span>
              <span className="text-xs text-slate-500">müstəqil mühit</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">100% təcrid olunmuş məlumatlar</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Anonim Şagird Sayı</span>
              <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap className="size-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950">{stats.totalStudents}</span>
              <span className="text-xs text-slate-500">şagird</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Bütün müəllimlər üzrə cəm</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ümumi Sınaq və Qrup</span>
              <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
                <ClipboardCheck className="size-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950">{stats.totalExams}</span>
              <span className="text-xs text-slate-500">sınaq / {stats.totalGroups} qrup</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Yalnız ümumi statistik say</p>
          </div>
        </div>

        {/* İki Sütunlu Cədvəl Bölməsi */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Son Yaradılan Müəllimlər */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Son Müəllim Hesabları</h3>
                <p className="text-xs text-slate-500">Platformada ən son yaradılmış müəllimlər</p>
              </div>
              <Link
                href="/admin/teachers"
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Hamısına bax <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentTeachers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Hələ heç bir müəllim qeydiyyatdan keçməyib.</div>
              ) : (
                recentTeachers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        {t.fullName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {t.workspaceName} • <span className="text-slate-400">{t.email}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          t.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {t.status === "active" ? "Aktiv" : "Dayandırılıb"}
                      </span>
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Bax
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Son Admin Əməliyyatları */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Son İnzibatçı Əməliyyatları</h3>
                <p className="text-xs text-slate-500">Sistemdə aparılan son admin fəaliyyətləri</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Jurnal <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentAuditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Hələ heç bir audit qeydi qeydə alınmayıb.</div>
              ) : (
                recentAuditLogs.map((log) => (
                  <div key={log.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{log.summary}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString("az", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                        {log.action}
                      </span>
                      <span className={log.status === "success" ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                        {log.status === "success" ? "Uğurlu" : "Uğursuz"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
