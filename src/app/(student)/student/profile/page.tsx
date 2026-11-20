import { Mail, Phone, UserRound } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentData } from "@/lib/queries/student";

export const instant = false;

export default async function StudentProfile() {
  const data = await getStudentData();
  const student: any = data?.student;
  return (
    <>
      <AppHeader title="Profilim" userName={student?.full_name || "Şagird"} role="student" />
      <main className="p-5 md:p-8">
        <PageHeader eyebrow="Hesab məlumatları" title="Profilim" description="Şəxsi məlumatlarınızı və cari qrupunuzu görün." />
        <section className="card max-w-2xl p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-4 border-b pb-5 sm:pb-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 sm:size-16"><UserRound className="size-6 sm:size-7" /></span>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold sm:text-xl">{student?.full_name || "Profil məlumatı yoxdur"}</h3>
              <p className="mt-1 truncate text-sm text-slate-500">{data?.membership?.groups?.name || "Qrup təyin edilməyib"}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-4 text-sm sm:mt-6">
            <div className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-x-3 gap-y-1 sm:grid-cols-[1rem_7rem_minmax(0,1fr)] sm:items-center">
              <Mail className="size-4 text-slate-400" /><dt className="text-slate-500">E-poçt</dt><dd className="col-start-2 break-all font-semibold sm:col-start-3">{student?.email || "Qeyd edilməyib"}</dd>
            </div>
            <div className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-x-3 gap-y-1 sm:grid-cols-[1rem_7rem_minmax(0,1fr)] sm:items-center">
              <Phone className="size-4 text-slate-400" /><dt className="text-slate-500">Telefon</dt><dd className="col-start-2 break-words font-semibold sm:col-start-3">{student?.phone || "Qeyd edilməyib"}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Məlumatlarınızda dəyişiklik lazımdırsa, müəlliminizlə əlaqə saxlayın.</p>
        </section>
      </main>
    </>
  );
}
