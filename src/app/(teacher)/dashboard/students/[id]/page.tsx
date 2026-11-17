import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, Pencil, Phone, TrendingUp, UserRound, X } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { StudentEditForm } from "@/components/forms/entity-forms";
import { DeleteStudentButton } from "@/components/students/delete-student-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormPanel } from "@/components/ui/form-panel";
import { getGroups, getStudent } from "@/lib/queries/teacher";
import { azDate, azMonthShort, azPercent, normalizeAzPhone } from "@/lib/utils";
import { performanceTrend } from "@/lib/calculations/scoring";

export const instant = false;

export default async function StudentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [student, groups] = await Promise.all([getStudent(id), getGroups()]) as [any, any[]];
  if (!student) notFound();

  const membership = student.group_memberships.find((item: any) => item.active);
  const results = [...(student.exam_results || [])].sort((a: any, b: any) => a.examinations.exam_date.localeCompare(b.examinations.exam_date));
  const scores = results.map((result: any) => Number(result.normalized_score));
  const average = scores.length ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : null;
  const trend = performanceTrend(scores.at(-1) ?? null, scores.at(-2) ?? null);
  const chart = results.map((result: any) => ({
    label: azMonthShort(result.examinations.exam_date),
    value: Number(result.normalized_score),
  }));

  return (
    <>
      <AppHeader title={student.full_name} />
      <main className="p-5 md:p-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><UserRound /></span>
            <div>
              <h2 className="text-2xl font-bold">{student.full_name}</h2>
              <p className="mt-1 text-sm text-slate-500">{membership?.groups?.name || "Aktiv qrup yoxdur"} · {student.email || "Aktiv hesab yoxdur"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={query.edit ? `/dashboard/students/${student.id}` : `/dashboard/students/${student.id}?edit=1`} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700">
              {query.edit ? <><X className="size-4" />Bağla</> : <><Pencil className="size-4" />Redaktə et</>}
            </Link>
            <DeleteStudentButton studentId={student.id} studentName={student.full_name} />
          </div>
        </div>

        {query.edit && (
          <FormPanel title="Şagird məlumatlarını redaktə et">
            <StudentEditForm student={student} groups={groups.filter((group) => group.status === "active")} currentGroupId={membership?.group_id} />
          </FormPanel>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Orta nəticə" value={azPercent(average)} detail="bütün sınaqlar" icon={TrendingUp} />
          <StatCard label="Sınaq sayı" value={String(results.length)} detail="qeydə alınmış nəticə" icon={ClipboardCheck} />
          <StatCard label="Son nəticə" value={azPercent(scores.at(-1))} detail={results.at(-1)?.examinations.title || "Nəticə yoxdur"} icon={ClipboardCheck} />
          <StatCard label="İnkişaf" value={trend.change == null ? "—" : `${trend.change > 0 ? "+" : ""}${trend.change.toFixed(1)} bənd`} detail={trend.status === "insufficient" ? "Kifayət qədər nəticə yoxdur" : trend.status === "improving" ? "Yüksələn performans" : trend.status === "declining" ? "Azalan performans" : "Sabit performans"} icon={TrendingUp} trend={trend.change} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <article className="card p-5 sm:p-6">
            <h3 className="font-bold">Performans xətti</h3>
            <p className="mt-1 text-sm text-slate-500">Nəticələrin xronoloji dəyişməsi</p>
            <div className="mt-4">{chart.length ? <PerformanceChart data={chart} /> : <EmptyState title="Nəticə yoxdur" description="Sınaq nəticələri daxil edildikdə qrafik yaranacaq." />}</div>
          </article>
          <article className="card p-5 sm:p-6">
            <h3 className="font-bold">Valideyn əlaqələri</h3>
            <p className="mt-1 text-xs text-slate-500">Yalnız müəllim üçün görünür</p>
            {student.parent_contacts?.length ? (
              <div className="mt-4 space-y-3">
                {student.parent_contacts.map((contact: any) => {
                  const phone = normalizeAzPhone(contact.phone || "");
                  return <div key={contact.id} className="rounded-xl border p-3"><p className="text-xs font-semibold uppercase text-slate-400">{contact.contact_type === "mother" ? "Ana" : contact.contact_type === "father" ? "Ata" : "Qəyyum"}</p><strong className="mt-1 block text-sm">{contact.full_name || "Ad qeyd edilməyib"}</strong>{contact.phone && <p className="mt-2 flex items-center gap-2 text-sm font-semibold tabular-nums text-slate-700"><Phone className="size-4 text-indigo-500" aria-hidden="true" /><span>{contact.phone}</span></p>}{phone && <div className="mt-3 flex flex-wrap gap-2"><a href={`tel:+${phone}`} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold"><Phone className="mr-1 inline size-3" />Zəng et</a><a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">WhatsApp</a></div>}</div>;
                })}
              </div>
            ) : <div className="mt-4"><EmptyState title="Əlaqə yoxdur" description="Valideyn əlaqə məlumatları əlavə edilməyib." /></div>}
          </article>
        </section>

        <section className="card mt-6 p-5 sm:p-6">
          <h3 className="font-bold">Sınaq tarixçəsi</h3>
          {results.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead className="border-b text-left text-xs uppercase text-slate-500"><tr><th className="py-3">Sınaq</th><th>Tarix</th><th>Düzgün cavab</th><th>Nəticə</th></tr></thead><tbody className="divide-y">{results.slice().reverse().map((result: any) => <tr key={result.examinations.id}><td className="py-3 font-semibold">{result.examinations.title}</td><td>{azDate(result.examinations.exam_date)}</td><td>{result.correct_answers} / {result.examinations.total_questions}</td><td className="font-bold text-indigo-600">{azPercent(Number(result.normalized_score))}</td></tr>)}</tbody></table></div> : <EmptyState title="Tarixçə boşdur" description="Bu şagird üçün sınaq nəticəsi qeydə alınmayıb." />}
        </section>

        {student.private_notes && <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-bold text-amber-900">Şəxsi müəllim qeydi</h3><p className="mt-2 text-sm leading-6 text-amber-800">{student.private_notes}</p></section>}
      </main>
    </>
  );
}
