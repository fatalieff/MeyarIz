import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Pencil, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { FormPanel } from "@/components/ui/form-panel";
import { ScheduleEditForm, ScheduleForm } from "@/components/forms/entity-forms";
import { EmptyState } from "@/components/ui/empty-state";
import { getGroups, getSchedules } from "@/lib/queries/teacher";
import { weekDays } from "@/lib/calculations/schedules";
import { azDate } from "@/lib/utils";
import { ScheduleExpiryRefresh } from "@/components/schedules/schedule-expiry-refresh";

export const instant = false;

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const [schedules, groups, params] = await Promise.all([getSchedules(), getGroups(), searchParams]);
  const weekdayKey = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Baku" }).format(new Date());
  const currentWeekday = ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 } as Record<string, number>)[weekdayKey];
  const weekly = (schedules as any[]).filter((schedule) => !schedule.is_extra);
  const extras = (schedules as any[]).filter((schedule) => schedule.is_extra).sort((a, b) => a.session_date.localeCompare(b.session_date) || a.start_time.localeCompare(b.start_time));
  const editing = (schedules as any[]).find((schedule) => schedule.id === params.edit);

  const expiryTimes = extras.map((schedule) => `${schedule.session_date}T${schedule.end_time}+04:00`);
  return <><ScheduleExpiryRefresh endTimes={expiryTimes}/><AppHeader title="Dərs cədvəli"/><main className="p-5 md:p-8">
    <PageHeader eyebrow="Dərs planı" title="Dərs cədvəli" description="Həftəlik dərsləri və konkret tarixli əlavə məşğələləri bir yerdə idarə edin." action={<Link href="?new=1" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4"/>Dərs vaxtı əlavə et</Link>}/>
    {params.new && <FormPanel title="Yeni dərs vaxtı"><ScheduleForm groups={(groups as any[]).filter((group) => group.status === "active")}/></FormPanel>}
    {editing && <FormPanel title="Dərs vaxtını dəyiş"><ScheduleEditForm schedule={editing}/></FormPanel>}

    {extras.length > 0 && <section className="mb-7">
      <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="font-bold text-slate-900">Yaxınlaşan əlavə dərslər</h2><p className="mt-1 text-sm text-slate-500">Bitmə vaxtı keçən sessiyalar bu siyahıdan avtomatik çıxır.</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{extras.length} əlavə dərs</span></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{extras.map((schedule) => <article key={schedule.id} className="card border-l-4 border-l-amber-400 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wide text-amber-700">Əlavə dərs</span><Link href={`/dashboard/groups/${schedule.groups.id}`} className="mt-1 block font-bold hover:text-indigo-600">{schedule.groups.name}</Link></div><CalendarDays className="size-5 text-amber-500"/></div>
        <p className="mt-3 text-sm font-semibold text-slate-700">{azDate(schedule.session_date)} · {weekDays[schedule.weekday]}</p>
        <span className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><Clock3 className="size-4"/>{schedule.start_time.slice(0,5)}–{schedule.end_time.slice(0,5)}</span>
        {schedule.location && <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4"/>{schedule.location}</span>}
        <Link href={`?edit=${schedule.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"><Pencil className="size-3"/>Dəyiş</Link>
      </article>)}</div>
    </section>}

    <div className="mb-3"><h2 className="font-bold text-slate-900">Həftəlik cədvəl</h2><p className="mt-1 text-sm text-slate-500">Hər həftə təkrarlanan dərs saatları.</p></div>
    {weekly.length ? <div className="grid gap-4 xl:grid-cols-7">{weekDays.slice(1).map((day, index) => {const slots=weekly.filter((schedule) => schedule.weekday === index + 1);return <section key={day} className={`card min-h-52 p-3 ${currentWeekday === index + 1 ? "ring-2 ring-indigo-400" : ""}`}><div className="mb-3 flex items-center justify-between border-b px-1 pb-3"><h3 className="text-sm font-bold">{day}</h3>{currentWeekday === index + 1 && <span className="size-2 rounded-full bg-indigo-500"/>}</div><div className="space-y-2">{slots.map((schedule) => <article key={schedule.id} className="rounded-xl border-l-4 bg-slate-50 p-3 text-xs transition hover:bg-white hover:shadow-sm" style={{borderLeftColor:schedule.groups.color}}><Link href={`/dashboard/groups/${schedule.groups.id}`} className="block truncate text-sm font-bold hover:text-indigo-600">{schedule.groups.name}</Link><span className="mt-2 flex items-center gap-1 text-slate-500"><Clock3 className="size-3"/>{schedule.start_time.slice(0,5)}–{schedule.end_time.slice(0,5)}</span>{schedule.location && <span className="mt-1 flex items-center gap-1 text-slate-500"><MapPin className="size-3"/>{schedule.location}</span>}<Link href={`?edit=${schedule.id}`} className="mt-2 inline-flex items-center gap-1 font-semibold text-indigo-600"><Pencil className="size-3"/>Dəyiş</Link></article>)}{!slots.length && <p className="py-8 text-center text-xs text-slate-400">Dərs yoxdur</p>}</div></section>})}</div> : <EmptyState title="Həftəlik cədvəl boşdur" description="Qruplara həftəlik dərs vaxtı və ya konkret tarixli əlavə dərs əlavə edin."/>}
  </main></>;
}
