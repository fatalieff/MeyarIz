import { CalendarDays, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentData } from "@/lib/queries/student";
import { azDate, azPercent } from "@/lib/utils";

export const instant = false;

export default async function ResultsPage() {
  const data = await getStudentData();
  const results = [...((data?.student as any)?.exam_results || [])].sort(
    (a: any, b: any) => b.examinations.exam_date.localeCompare(a.examinations.exam_date),
  );

  return (
    <>
      <AppHeader title="Mənim nəticələrim" userName={(data?.student as any)?.full_name || "Şagird"} role="student" />
      <main className="p-5 md:p-8">
        <PageHeader eyebrow="Sınaq tarixçəsi" title="Mənim nəticələrim" description="Qeydə alınmış bütün sınaq nəticələrinizi xronoloji izləyin." />
        {results.length ? (
          <section className="card overflow-hidden">
            <div className="divide-y sm:hidden">
              {results.map((result: any) => (
                <article key={result.examinations.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-slate-900">{result.examinations.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="size-3.5" />
                        {azDate(result.examinations.exam_date)}
                      </p>
                    </div>
                    <strong className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-lg text-indigo-600">
                      {azPercent(Number(result.normalized_score))}
                    </strong>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 border-t pt-3 text-xs text-slate-600">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    {result.correct_answers} / {result.examinations.total_questions} düzgün cavab
                  </p>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr><th className="px-5 py-4">Sınaq</th><th className="px-5 py-4">Tarix</th><th className="px-5 py-4">Düzgün cavab</th><th className="px-5 py-4 text-right">Nəticə</th></tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((result: any) => (
                    <tr key={result.examinations.id}>
                      <td className="px-5 py-4 font-semibold">{result.examinations.title}</td>
                      <td className="px-5 py-4 text-slate-500">{azDate(result.examinations.exam_date)}</td>
                      <td className="px-5 py-4">{result.correct_answers} / {result.examinations.total_questions}</td>
                      <td className="px-5 py-4 text-right text-lg font-bold text-indigo-600">{azPercent(Number(result.normalized_score))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <EmptyState title="Hələ nəticəniz yoxdur" description="Müəlliminiz sınaq nəticəsini daxil etdikdə burada görünəcək." />
        )}
      </main>
    </>
  );
}
