"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, ChevronRight, ClipboardCheck, Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { EmptyState } from "@/components/ui/empty-state";
import { activeExamFilterCount, defaultExamFilters, examAverage, filterAndSortExams, type ExamFilters, type ExamForFiltering } from "@/lib/calculations/exams";
import { azDate, azPercent } from "@/lib/utils";

type ExamRow = ExamForFiltering & { total_questions: number; groups: ExamForFiltering["groups"] & { color?: string } };
const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

export function ExamBrowser({ exams }: { exams: ExamRow[] }) {
  const [filters, setFilters] = useState<ExamFilters>(defaultExamFilters);
  const update = <K extends keyof ExamFilters>(key: K, value: ExamFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const visible = useMemo(() => filterAndSortExams([...exams], filters), [exams, filters]);
  const activeCount = activeExamFilterCount(filters);
  const months = useMemo(() => [...new Set(exams.map((exam) => exam.exam_date.slice(0, 7)))].sort().reverse().map((value) => { const [year, month] = value.split("-").map(Number); return { value, label: `${monthNames[month - 1]} ${year}` }; }), [exams]);
  const groups = useMemo(() => [...new Map(exams.map((exam) => [exam.groups.id, { value: exam.groups.id, label: exam.groups.name }])).values()].sort((a, b) => a.label.localeCompare(b.label, "az-AZ")), [exams]);

  return <>
    <section className="card mb-6 overflow-visible p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Filter className="size-4"/></span><div><h2 className="text-sm font-bold text-slate-900">Filtr və sıralama</h2><p className="text-xs text-slate-500">Sınaqlar seçimlərinizə uyğun dərhal yenilənir.</p></div></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{visible.length} / {exams.length} sınaq</span>{activeCount>0&&<button type="button" onClick={()=>setFilters(defaultExamFilters)} className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"><RotateCcw className="size-3.5"/>Sıfırla</button>}</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative xl:col-span-1"><span className="sr-only">Sınaq adı ilə axtar</span><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400"/><input value={filters.query} onChange={(event)=>update("query",event.target.value)} className="focus-ring h-11 w-full rounded-xl border bg-white pl-9 pr-3 text-sm outline-none" placeholder="Sınaq adı ilə axtar"/></label>
        <CustomSelect key={`month-${filters.month}`} defaultValue={filters.month} options={[{value:"all",label:"Bütün aylar"},...months]} ariaLabel="Sınaq ayı" onValueChange={(value)=>update("month",value)}/>
        <CustomSelect key={`group-${filters.groupId}`} defaultValue={filters.groupId} options={[{value:"all",label:"Bütün qruplar"},...groups]} ariaLabel="Sınaq qrupu" onValueChange={(value)=>update("groupId",value)}/>
        <CustomSelect key={`result-${filters.resultStatus}`} defaultValue={filters.resultStatus} options={[{value:"all",label:"Bütün nəticə vəziyyətləri"},{value:"announced",label:"Nəticəsi açıqlanan"},{value:"unannounced",label:"Nəticəsi açıqlanmayan"}]} ariaLabel="Nəticə vəziyyəti" onValueChange={(value)=>update("resultStatus",value as ExamFilters["resultStatus"])}/>
        <div className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-slate-400"/><CustomSelect key={`sort-${filters.sort}`} className="[&_button]:pl-9" defaultValue={filters.sort} options={[{value:"newest",label:"Ən yenidən"},{value:"oldest",label:"Ən köhnədən"},{value:"score-desc",label:"Nəticə: çoxdan aza"},{value:"score-asc",label:"Nəticə: azdan çoxa"}]} ariaLabel="Sınaqların sıralanması" onValueChange={(value)=>update("sort",value as ExamFilters["sort"])}/></div>
      </div>
      {activeCount>0&&<p className="mt-3 text-xs font-medium text-indigo-600">{activeCount} aktiv filtr tətbiq olunub.</p>}
    </section>

    {visible.length?<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((exam)=>{const average=examAverage(exam);const hasResults=exam.exam_results.length>0;return <Link key={exam.id} href={`/dashboard/exams/${exam.id}`} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><ClipboardCheck className="size-5"/></span><div className="text-right"><span className="block text-2xl font-bold text-slate-900">{azPercent(average)}</span><span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${hasResults?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{hasResults&&<CheckCircle2 className="size-3"/>}{hasResults?"Nəticə açıqlanıb":"Nəticə gözlənilir"}</span></div></div><h3 className="mt-5 font-bold">{exam.title}</h3><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><span className="size-2 rounded-full" style={{backgroundColor:exam.groups.color||"#6366f1"}}/>{exam.groups.name}</p><div className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-xs text-slate-500"><span className="flex items-center gap-1"><Calendar className="size-3.5"/>{azDate(exam.exam_date)}</span><span>{exam.exam_results.length} nəticə · {exam.total_questions} sual</span></div><div className="mt-4 flex items-center justify-end gap-1 text-sm font-semibold text-indigo-600">Nəticələri aç<ChevronRight className="size-4 transition group-hover:translate-x-0.5"/></div></Link>})}</section>:<EmptyState title="Seçimlərə uyğun sınaq tapılmadı" description="Filtrlərdən birini dəyişin, axtarışı təmizləyin və ya bütün filtrləri sıfırlayın."/>}
  </>;
}
