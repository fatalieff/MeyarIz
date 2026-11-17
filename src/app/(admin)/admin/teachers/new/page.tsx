import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { CreateTeacherForm } from "@/components/admin/teacher-form";
import { ChevronLeft, ShieldCheck, Lock, Layers } from "lucide-react";

export default function NewTeacherPage() {
  return (
    <>
      <AdminHeader title="Yeni Müəllim Yarat" />
      <main className="px-5 py-8 md:px-8">
        <div className="mb-6">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
          >
            <ChevronLeft className="size-4" /> Müəllimlər siyahısına qayıt
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Müəllim Məlumatları və Giriş Hesabı</h2>
              <p className="mt-1 text-xs text-slate-500">
                Formanı dolduraraq yeni müəllim üçün təcrid olunmuş iş sahəsi və ilkin giriş hesabı formalaşdırın.
              </p>
            </div>

            <CreateTeacherForm />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600">
                <Layers className="size-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Ayrıca Workspace Qaydası</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Hər müəllim qeydiyyatdan keçdikdə onun üçün tamamilə fərdi `teacher_workspaces` sahəsi açılır. Müəllim A heç vaxt Müəllim B-nin qruplarını və ya şagirdlərini görə bilməz.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900">
                <Lock className="size-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Müvəqqəti Şifrə Təhlükəsizliyi</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Daxil etdiyiniz müvəqqəti şifrə birbaşa Supabase Auth mühərrikinə şifrələnmiş şəkildə ötürülür. Şifrə bazada açıq saxlanılmır, cavablarda brauzerə qaytarılmır və audit loglarına yazılmır.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="size-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Atomik Rollback</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Hesabın yaradılması zamanı hər hansı bir mərhələdə xəta baş verərsə, yaradılmış bütün natamam Auth istifadəçisi və məlumatlar dərhal geri təmizlənir.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
