import { CalendarX2, Clock3, MapPin } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentData } from "@/lib/queries/student";
import { nextScheduleOccurrenceDate, weekDays } from "@/lib/calculations/schedules";
import { azDate } from "@/lib/utils";
import { ScheduleExpiryRefresh } from "@/components/schedules/schedule-expiry-refresh";

export const instant = false;

export default async function StudentSchedule() {
  const data = await getStudentData();
  const student: any = data?.student;
  const group: any = data?.membership?.groups;
  const slots = [...(group?.group_schedules || [])];
  const weekly = slots
    .filter((schedule: any) => !schedule.is_extra)
    .sort(
      (a: any, b: any) =>
        a.weekday - b.weekday || a.start_time.localeCompare(b.start_time),
    );
  const extras = slots
    .filter((schedule: any) => schedule.is_extra)
    .sort(
      (a: any, b: any) =>
        a.session_date.localeCompare(b.session_date) ||
        a.start_time.localeCompare(b.start_time),
    );
  const expiryTimes = extras.map(
    (schedule: any) => `${schedule.session_date}T${schedule.end_time}+04:00`,
  );

  return (
    <>
      <ScheduleExpiryRefresh endTimes={expiryTimes} />
      <AppHeader
        title="Dərs cədvəlim"
        userName={student?.full_name || "Şagird"}
        role="student"
      />
      <main className="p-5 md:p-8">
        <PageHeader
          eyebrow={group?.name || "Qrup"}
          title="Dərs cədvəlim"
          description="Həftəlik dərsləriniz və müəllimin təyin etdiyi yaxınlaşan əlavə məşğələlər."
        />

        {extras.length > 0 && (
          <section className="mb-7">
            <div className="mb-3">
              <h2 className="font-bold">Yaxınlaşan əlavə dərslər</h2>
              <p className="mt-1 text-sm text-slate-500">
                Dərs bitdikdən sonra avtomatik olaraq bu siyahıdan çıxacaq.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {extras.map((schedule: any) => (
                <article
                  key={schedule.id}
                  className="card border-l-4 border-l-amber-400 bg-amber-50/30 p-5"
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Əlavə dərs
                  </span>
                  <h3 className="mt-2 font-bold">
                    {azDate(schedule.session_date)} · {weekDays[schedule.weekday]}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-lg font-semibold">
                    <Clock3 className="size-5 text-amber-500" />
                    {schedule.start_time.slice(0, 5)}–{schedule.end_time.slice(0, 5)}
                  </p>
                  {schedule.location && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="size-4" />
                      {schedule.location}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3">
            <h2 className="font-bold">Həftəlik dərslər</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hər həftə təkrarlanan dərs vaxtlarınız.
            </p>
          </div>
          {weekly.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {weekly.map((schedule: any) => {
                const nextDate = nextScheduleOccurrenceDate(
                  schedule.weekday,
                  schedule.end_time,
                );
                const isNextCancelled = schedule.group_schedule_cancellations?.some(
                  (cancellation: any) => cancellation.occurrence_date === nextDate,
                );

                return (
                  <article
                    key={schedule.id}
                    className={`card border-l-4 p-5 ${isNextCancelled ? "border border-rose-200 bg-rose-50/50" : ""}`}
                    style={{ borderLeftColor: isNextCancelled ? "#e11d48" : group.color }}
                  >
                    <h3 className="font-bold">{weekDays[schedule.weekday]}</h3>
                    <p className="mt-3 flex items-center gap-2 text-lg font-semibold">
                      <Clock3 className={`size-5 ${isNextCancelled ? "text-rose-500" : "text-indigo-500"}`} />
                      {schedule.start_time.slice(0, 5)}–{schedule.end_time.slice(0, 5)}
                    </p>
                    {schedule.location && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="size-4" />
                        {schedule.location}
                      </p>
                    )}
                    {isNextCancelled && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-white/80 p-3 text-sm text-rose-800">
                        <strong className="flex items-center gap-2">
                          <CalendarX2 className="size-4" />
                          Yalnız bu dərs ləğv edilib
                        </strong>
                        <p className="mt-1 text-xs leading-5">
                          {azDate(nextDate)} tarixli dərs baş tutmayacaq. Dərs gələn həftə cədvəl üzrə davam edəcək.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Həftəlik dərs cədvəli yoxdur"
              description="Müəlliminiz qrup üçün dərs vaxtı əlavə etdikdə burada görünəcək."
            />
          )}
        </section>
      </main>
    </>
  );
}
