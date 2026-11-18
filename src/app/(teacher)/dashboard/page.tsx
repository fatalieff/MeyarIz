import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { getDashboard } from "@/lib/queries/teacher";
import { azDate, azMonthShort, azPercent } from "@/lib/utils";
import { bakuDateTime, weekDays } from "@/lib/calculations/schedules";
import { rankingPeriodLabels } from "@/lib/calculations/ranking-period";
export const instant = false;
function bakuNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Baku",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return {
    weekday: map[parts.find((p) => p.type === "weekday")?.value || "Mon"],
    time: `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}`,
  };
}
export default async function Dashboard() {
  const data = await getDashboard();
  const periodLabel = rankingPeriodLabels[data.rankingPeriod];
  const now = { ...bakuNow(), ...bakuDateTime() };
  const today = (data.schedules as any[])
    .filter((s) =>
      s.is_extra ? s.session_date === now.date : s.weekday === now.weekday,
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const monthly = new Map<string, number[]>();
  (data.results as any[]).forEach((r) => {
    const d = new Date(r.examinations.exam_date);
    const label = `${azMonthShort(d)} '${String(d.getFullYear()).slice(-2)}`;
    monthly.set(label, [
      ...(monthly.get(label) || []),
      Number(r.normalized_score),
    ]);
  });
  const chart = [...monthly].map(([label, s]) => ({
    label,
    value: Number((s.reduce((a, b) => a + b, 0) / s.length).toFixed(1)),
  }));
  return (
    <>
      <AppHeader title="İdarəetmə paneli" />
      <main className="p-5 md:p-8">
        {!data.configured && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Supabase bağlantısı gözlənilir.</strong> `.env.local`
            faylında layihə məlumatlarını əlavə etdikdən sonra real göstəricilər
            burada görünəcək.
          </div>
        )}
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {azDate(now.date)} · Bakı
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Gününüz uğurlu keçsin 👋
            </h2>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/groups?new=1"
              className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Yeni qrup
            </Link>
            <Link
              href="/dashboard/exams?new=1"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              Yeni sınaq
            </Link>
          </div>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Ümumi şagird sayı"
            value={String(data.students)}
            detail="aktiv şagird"
            icon={Users}
          />
          <StatCard
            label="Aktiv qruplar"
            value={String(data.groups)}
            detail="davam edən qrup"
            icon={GraduationCap}
          />
          <StatCard
            label="Orta nəticə"
            value={azPercent(data.average)}
            detail={`${periodLabel.toLocaleLowerCase("az-AZ")} əsasında`}
            icon={TrendingUp}
          />
          <StatCard
            label="Keçirilən sınaqlar"
            value={String(data.exams)}
            detail="ümumi sınaq sayı"
            icon={ClipboardCheck}
          />
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
          <article className="card p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Aylıq performans</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {periodLabel} üzrə orta göstərici
                </p>
              </div>
              <Badge tone="brand">0–100 bal</Badge>
            </div>
            {chart.length ? (
              <PerformanceChart data={chart} />
            ) : (
              <EmptyState
                title="Hələ nəticə yoxdur"
                description="Sınaq nəticələri əlavə edildikdən sonra performans qrafiki burada görünəcək."
              />
            )}
          </article>
          <article className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Bugünkü dərslərim</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {weekDays[now.weekday]}
                </p>
              </div>
              <CalendarDays className="text-indigo-500" />
            </div>
            {today.length ? (
              <div className="space-y-3">
                {today.map((s: any) => {
                  const status =
                    now.time < s.start_time
                      ? "Gözlənilir"
                      : now.time < s.end_time
                        ? "Davam edir"
                        : "Tamamlanıb";
                  return (
                    <Link
                      href={`/dashboard/groups/${s.groups.id}`}
                      key={s.id}
                      className="block rounded-2xl border p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                      <div className="flex items-center justify-between">
                        <strong>{s.groups.name}</strong>
                        <div className="flex items-center gap-2">
                          {s.is_extra && <Badge tone="warning">Əlavə</Badge>}
                          <Badge
                            tone={
                              status === "Davam edir"
                                ? "success"
                                : status === "Gözlənilir"
                                  ? "brand"
                                  : "neutral"
                            }
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="size-4" />
                          {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                        </span>
                        <span>
                          {s.groups.group_memberships?.[0]?.count || 0} şagird
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Bu gün üçün dərs planlaşdırılmayıb"
                description="Həftəlik və ya əlavə dərs vaxtı yarada bilərsiniz."
              />
            )}
          </article>
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <article className="card p-5 sm:p-6">
            <h3 className="font-bold">Ən yüksək nəticələr</h3>
            <p className="mt-1 text-sm text-slate-500">
              {periodLabel} nəticələrinə görə
            </p>
            {data.leaders.length ? (
              <div className="mt-5 space-y-2">
                {(data.leaders as any[]).map((row, i) => (
                  <div
                    key={row.student_id}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm">
                        {row.full_name}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {row.group_name} · {row.examination_count} sınaq
                      </span>
                    </div>
                    <strong className="text-indigo-600">
                      {azPercent(Number(row.ranking_score))}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Reytinq formalaşmayıb"
                  description="Ən azı iki nəticəsi olan şagirdlər burada görünəcək."
                />
              </div>
            )}
          </article>
          <article className="card p-5 sm:p-6">
            <h3 className="font-bold">Son sınaqlar</h3>
            <p className="mt-1 text-sm text-slate-500">
              Ən son sınaq fəaliyyəti
            </p>
            {data.recentExams.length ? (
              <div className="mt-5 divide-y">
                {(data.recentExams as any[]).map((exam) => {
                  const scores = exam.exam_results.map((r: any) =>
                    Number(r.normalized_score),
                  );
                  const avg = scores.length
                    ? scores.reduce((a: number, b: number) => a + b, 0) /
                      scores.length
                    : null;
                  return (
                    <Link
                      key={exam.id}
                      href={`/dashboard/exams/${exam.id}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                        <ClipboardCheck className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {exam.title}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {exam.groups.name} · {azDate(exam.exam_date)}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {azPercent(avg)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Sınaq yoxdur"
                  description="İlk aylıq sınağınızı yaradın və nəticələri daxil edin."
                />
              </div>
            )}
          </article>
        </section>
      </main>
    </>
  );
}
