import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminTeacherDetails } from "@/lib/queries/admin";
import { TeacherActions } from "@/components/admin/teacher-actions";

export const instant = false;
import {
  ChevronLeft,
  Mail,
  Layers,
  GraduationCap,
  Users,
  ClipboardCheck,
  ShieldCheck,
  ShieldAlert,
  History,
} from "lucide-react";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getAdminTeacherDetails(id);

  if (!teacher) {
    notFound();
  }

  return (
    <>
      <AdminHeader title={`Müəllim: ${teacher.fullName}`} />
      <main className="px-5 py-8 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
          >
            <ChevronLeft className="size-4" /> Müəllimlər siyahısına qayıt
          </Link>

          <TeacherActions
            teacher={{
              id: teacher.id,
              fullName: teacher.fullName,
              workspaceName: teacher.workspaceName,
              status: teacher.status,
            }}
          />
        </div>

        {/* Müəllim Əsas Kartı */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 font-bold text-xl text-indigo-700">
                {teacher.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{teacher.fullName}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      teacher.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {teacher.status === "active" ? (
                      <>
                        <ShieldCheck className="size-3" />
                        Aktiv
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="size-3" />
                        Dayandırılıb
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="size-3.5 text-slate-400" />
                  {teacher.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Qeydiyyat</span>
                <span className="font-semibold text-slate-700">
                  {new Date(teacher.createdAt).toLocaleDateString("az", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Son Giriş</span>
                <span className="font-semibold text-slate-700">
                  {teacher.lastSignInAt
                    ? new Date(teacher.lastSignInAt).toLocaleDateString("az", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Məlumat yoxdur"}
                </span>
              </div>
            </div>
          </div>

          {/* İş Sahəsi və Anonim Ümumi Saylar */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Layers className="size-3.5 text-indigo-600" /> İş Sahəsi Adı
              </span>
              <p className="mt-2 text-base font-bold text-slate-900">{teacher.workspaceName}</p>
              <p className="mt-1 text-[11px] text-slate-400">Təcrid olunmuş workspace</p>
              <p className="mt-2 text-xs font-semibold text-indigo-700">Ödəniş: {teacher.billingModel === "CALENDAR_MONTH" ? "Təqvim ayı" : teacher.billingModel === "ANNIVERSARY_MONTH" ? "Fərdi aylıq dövr" : teacher.billingModel === "LESSON_PACKAGE" ? "Dərs paketi" : "Təyin edilməyib"}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Users className="size-3.5 text-blue-600" /> Şagirdlərin Sayı
              </span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{teacher.studentCount}</p>
              <p className="mt-1 text-[11px] text-slate-400">Yalnız ümumi say göstərilir</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <GraduationCap className="size-3.5 text-purple-600" /> Qrupların Sayı
              </span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{teacher.groupCount}</p>
              <p className="mt-1 text-[11px] text-slate-400">Yalnız ümumi say göstərilir</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <ClipboardCheck className="size-3.5 text-emerald-600" /> Sınaqların Sayı
              </span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{teacher.examCount}</p>
              <p className="mt-1 text-[11px] text-slate-400">Yalnız ümumi say göstərilir</p>
            </div>
          </div>
        </div>

        {/* Təhlükəsizlik və Məlumat Məxfiliyi Bildirişi */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-center gap-3">
          <ShieldCheck className="size-5 shrink-0 text-indigo-600" />
          <p>
            <strong>Məlumat Məxfiliyi Qaydası:</strong> İnzibatçı paneli müəllimin şagird adlarını, qrup adlarını, sınaq suallarını və ya qiymətləndirmə nəticələrini əldə etmir. Burada yalnız ümumi statistik saylar təqdim olunur.
          </p>
        </div>

        {/* Bu Müəllim Üzrə Son İnzibatçı Audit Qeydləri */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <History className="size-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">Bu Müəllim Üzrə Admin Fəaliyyət Tarixçəsi</h3>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {teacher.auditLogs.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Bu hesab üzrə heç bir əməliyyat qeydi yoxdur.</p>
            ) : (
              teacher.auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{log.summary}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400 font-mono">Əməliyyat: {log.action}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleDateString("az", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className={`block text-[10px] font-bold ${log.status === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                      {log.status === "success" ? "Uğurlu" : "Uğursuz"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
