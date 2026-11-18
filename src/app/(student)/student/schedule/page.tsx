import { Clock3, MapPin } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentData } from "@/lib/queries/student";
import { weekDays } from "@/lib/calculations/schedules";
import { azDate } from "@/lib/utils";
import { ScheduleExpiryRefresh } from "@/components/schedules/schedule-expiry-refresh";

export const instant = false;

export default async function StudentSchedule(){
  const data=await getStudentData();const student:any=data?.student;const group:any=data?.membership?.groups;
  const slots=[...(group?.group_schedules||[])];
  const weekly=slots.filter((schedule:any)=>!schedule.is_extra).sort((a:any,b:any)=>a.weekday-b.weekday||a.start_time.localeCompare(b.start_time));
  const extras=slots.filter((schedule:any)=>schedule.is_extra).sort((a:any,b:any)=>a.session_date.localeCompare(b.session_date)||a.start_time.localeCompare(b.start_time));
  const expiryTimes=extras.map((schedule:any)=>`${schedule.session_date}T${schedule.end_time}+04:00`);
  return <><ScheduleExpiryRefresh endTimes={expiryTimes}/><AppHeader title="Dərs cədvəlim" userName={student?.full_name||"Şagird"} role="student"/><main className="p-5 md:p-8"><PageHeader eyebrow={group?.name||"Qrup"} title="Dərs cədvəlim" description="Həftəlik dərsləriniz və müəllimin təyin etdiyi yaxınlaşan əlavə məşğələlər."/>
    {extras.length>0&&<section className="mb-7"><div className="mb-3"><h2 className="font-bold">Yaxınlaşan əlavə dərslər</h2><p className="mt-1 text-sm text-slate-500">Dərs bitdikdən sonra avtomatik olaraq bu siyahıdan çıxacaq.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{extras.map((schedule:any)=><article key={schedule.id} className="card border-l-4 border-l-amber-400 bg-amber-50/30 p-5"><span className="text-xs font-bold uppercase tracking-wide text-amber-700">Əlavə dərs</span><h3 className="mt-2 font-bold">{azDate(schedule.session_date)} · {weekDays[schedule.weekday]}</h3><p className="mt-3 flex items-center gap-2 text-lg font-semibold"><Clock3 className="size-5 text-amber-500"/>{schedule.start_time.slice(0,5)}–{schedule.end_time.slice(0,5)}</p>{schedule.location&&<p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="size-4"/>{schedule.location}</p>}</article>)}</div></section>}
    <section><div className="mb-3"><h2 className="font-bold">Həftəlik dərslər</h2><p className="mt-1 text-sm text-slate-500">Hər həftə təkrarlanan dərs vaxtlarınız.</p></div>{weekly.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{weekly.map((schedule:any)=><article key={schedule.id} className="card border-l-4 p-5" style={{borderLeftColor:group.color}}><h3 className="font-bold">{weekDays[schedule.weekday]}</h3><p className="mt-3 flex items-center gap-2 text-lg font-semibold"><Clock3 className="size-5 text-indigo-500"/>{schedule.start_time.slice(0,5)}–{schedule.end_time.slice(0,5)}</p>{schedule.location&&<p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="size-4"/>{schedule.location}</p>}</article>)}</div>:<EmptyState title="Həftəlik dərs cədvəli yoxdur" description="Müəlliminiz qrup üçün dərs vaxtı əlavə etdikdə burada görünəcək."/>}</section>
  </main></>;
}
