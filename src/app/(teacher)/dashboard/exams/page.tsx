import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { FormPanel } from "@/components/ui/form-panel";
import { ExamForm } from "@/components/forms/entity-forms";
import { EmptyState } from "@/components/ui/empty-state";
import { ExamBrowser } from "@/components/exams/exam-browser";
import { getExams, getGroups } from "@/lib/queries/teacher";

export const instant = false;

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [exams, groups, params] = await Promise.all([getExams(), getGroups(), searchParams]);
  return <><AppHeader title="Sınaqlar"/><main className="p-5 md:p-8">
    <PageHeader eyebrow="Nəticələrin idarə edilməsi" title="Sınaqlar" description="Sınaqları ay, qrup və nəticə vəziyyətinə görə süzün; tarixə və orta nəticəyə görə sıralayın." action={<Link href="?new=1" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4"/>Yeni sınaq</Link>}/>
    {params.new&&<FormPanel title="Yeni sınaq"><ExamForm groups={(groups as any[]).filter((group)=>group.status==="active")}/></FormPanel>}
    {exams.length?<ExamBrowser exams={exams as any[]}/>:<EmptyState title="Hələ sınaq yoxdur" description="İlk sınağı yaradın, sonra qrup şagirdlərinin düzgün cavablarını daxil edin."/>}
  </main></>;
}
