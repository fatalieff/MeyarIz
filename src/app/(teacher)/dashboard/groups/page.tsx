import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { FormPanel } from "@/components/ui/form-panel";
import { GroupForm } from "@/components/forms/entity-forms";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getGroups } from "@/lib/queries/teacher";
import { weekDays } from "@/lib/calculations/schedules";
import { cn, isLightColor } from "@/lib/utils";

export const instant = false;

interface GroupsPageProps {
  searchParams: Promise<{
    new?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const [allGroups, params] = await Promise.all([getGroups(), searchParams]);

  const currentStatus = params.status === "archived" ? "archived" : "active";
  const searchQuery = (params.q || "").trim().toLocaleLowerCase("az");

  // Filter groups by status and search query
  const groupsList = (allGroups as any[]) || [];
  const activeCount = groupsList.filter((g) => g.status === "active").length;
  const archivedCount = groupsList.filter((g) => g.status === "archived").length;

  const totalStudents = groupsList
    .filter((g) => g.status === "active")
    .reduce((sum, g) => sum + (g.group_memberships?.[0]?.count || 0), 0);

  const weeklyLessonsCount = groupsList
    .filter((g) => g.status === "active")
    .reduce(
      (sum, g) =>
        sum + (g.group_schedules?.filter((s: any) => !s.is_extra)?.length || 0),
      0
    );

  const filteredGroups = groupsList
    .filter((g) => g.status === currentStatus)
    .filter((g) => {
      if (!searchQuery) return true;
      const nameMatch = g.name.toLocaleLowerCase("az").includes(searchQuery);
      const descMatch = g.description?.toLocaleLowerCase("az").includes(searchQuery);
      const levelMatch = g.preparation_level?.toLocaleLowerCase("az").includes(searchQuery);
      return nameMatch || descMatch || levelMatch;
    });

  return (
    <>
      <AppHeader title="Qruplar" />

      <main className="p-5 md:p-8 space-y-7 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <PageHeader
          eyebrow="Tədris idarəetməsi"
          title="Tədris Qrupları"
          description="Tədris qruplarını formalaşdırın, şagird tərkibini və həftəlik dərs cədvəlini vahid mərkəzdən idarə edin."
          action={
            <Link
              href="?new=1"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="size-4" />
              Yeni qrup yarat
            </Link>
          }
        />

        {/* Yeni Qrup Yaratma Paneli */}
        {params.new && (
          <FormPanel title="Yeni Tədris Qrupu">
            <GroupForm />
          </FormPanel>
        )}

        {/* KPI / İcmal Statistik Kartları */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Aktiv Qruplar */}
          <div className="card relative overflow-hidden p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Aktiv Qruplar
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {activeCount}
                  </span>
                  <span className="text-xs font-medium text-slate-500">qrup</span>
                </div>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="size-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              <span>{archivedCount} qrup arxivdə saxlanılır</span>
            </div>
          </div>

          {/* Aktiv Şagird Tutumu */}
          <div className="card relative overflow-hidden p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Şagird Heyəti
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {totalStudents}
                  </span>
                  <span className="text-xs font-medium text-slate-500">şagird</span>
                </div>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                <Users className="size-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <Sparkles className="size-3.5 text-sky-500" />
              <span>Aktiv qruplardakı cəmi üzvlər</span>
            </div>
          </div>

          {/* Həftəlik Dərs Saatları */}
          <div className="card relative overflow-hidden p-5 transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Həftəlik Qrafik
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {weeklyLessonsCount}
                  </span>
                  <span className="text-xs font-medium text-slate-500">dərs / həftə</span>
                </div>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl bg-purple-50 text-purple-600">
                <CalendarDays className="size-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <Clock className="size-3.5 text-purple-500" />
              <span>Daimi tədris seansları</span>
            </div>
          </div>
        </section>

        {/* Toolbar: Axtarış və Status Filtrləri */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100/90 p-1 text-xs font-semibold shadow-inner">
            <Link
              href={searchQuery ? `?status=active&q=${encodeURIComponent(searchQuery)}` : "?status=active"}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all",
                currentStatus === "active"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              )}
            >
              <span>Aktiv</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  currentStatus === "active"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-200/80 text-slate-600"
                )}
              >
                {activeCount}
              </span>
            </Link>

            <Link
              href={searchQuery ? `?status=archived&q=${encodeURIComponent(searchQuery)}` : "?status=archived"}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all",
                currentStatus === "archived"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              )}
            >
              <span>Arxiv</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  currentStatus === "archived"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200/80 text-slate-600"
                )}
              >
                {archivedCount}
              </span>
            </Link>
          </div>

          {/* Search Box */}
          <form className="relative flex-1 sm:max-w-xs">
            {currentStatus === "archived" && (
              <input type="hidden" name="status" value="archived" />
            )}
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Qrup adına görə axtar..."
              className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300"
            />
          </form>
        </section>

        {/* Qruplar Şəbəkəsi (Cards Grid) */}
        {filteredGroups.length ? (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((g) => {
              const studentsCount = g.group_memberships?.[0]?.count || 0;
              const regularSchedules = (g.group_schedules || []).filter(
                (s: any) => !s.is_extra
              );
              const groupColor = g.color || "#4f46e5";
              const isLight = isLightColor(groupColor);

              return (
                <Link
                  key={g.id}
                  href={`/dashboard/groups/${g.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                >
                  {/* Qrupun Fərdi Rəng Zolağı */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 top-0 h-1.5 transition-all duration-300 group-hover:h-2",
                      isLight && "border-b border-slate-300/80"
                    )}
                    style={{ backgroundColor: groupColor }}
                  />

                  {/* Yuxarı Başlıq və Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      {/* Logo / Rəngli Nişan */}
                      <div
                        className={cn(
                          "grid size-12 shrink-0 place-items-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105",
                          isLight
                            ? "border border-slate-300/80 ring-1 ring-slate-900/5 bg-white text-slate-900"
                            : "text-white shadow-md"
                        )}
                        style={{
                          backgroundColor: groupColor,
                        }}
                      >
                        <Users className={cn("size-5", isLight ? "text-slate-900" : "text-white")} />
                      </div>

                      {/* Badgelər */}
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {g.preparation_level && (
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {g.preparation_level}
                          </span>
                        )}
                        <Badge tone={g.status === "active" ? "success" : "neutral"}>
                          {g.status === "active" ? "Aktiv" : "Arxiv"}
                        </Badge>
                      </div>
                    </div>

                    {/* Qrup Adı və Təsviri */}
                    <div className="mt-4">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 line-clamp-1">
                        {g.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-500">
                        {g.description || "Bu qrup üçün hələ xüsusi təsvir əlavə edilməyib."}
                      </p>
                    </div>

                    {/* Tədris Cədvəli Nişanları */}
                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <CalendarDays className="size-3.5" />
                        <span>Dərs Cədvəli</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {regularSchedules.length ? (
                          regularSchedules.slice(0, 3).map((s: any) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200/70 px-2 py-1 text-[11px] font-medium text-slate-700"
                            >
                              <span className="font-semibold text-slate-900">
                                {weekDays[s.weekday]}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="font-mono text-slate-600">
                                {s.start_time.slice(0, 5)}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            Cədvəl təyin edilməyib
                          </span>
                        )}
                        {regularSchedules.length > 3 && (
                          <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700">
                            +{regularSchedules.length - 3} gün
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alt Zolaq: Şagird Sayı və Ətraflı Keçid */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <div className="grid size-6 place-items-center rounded-full bg-slate-100 text-slate-600">
                        <Users className="size-3.5" />
                      </div>
                      <span>
                        <strong className="text-slate-900">{studentsCount}</strong> şagird
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-600 group-hover:text-indigo-700">
                      <span>İdarə et</span>
                      <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <EmptyState
            title={
              searchQuery
                ? "Axtarışa uyğun qrup tapılmadı"
                : currentStatus === "archived"
                ? "Arxivdə heç bir qrup yoxdur"
                : "Hələ qrup yaradılmayıb"
            }
            description={
              searchQuery
                ? `"${params.q}" sorğusu üzrə heç bir nəticə mövcud deyil. Axtarış sözünü dəyişin.`
                : "Yeni tədris qrupu yaradaraq şagirdlərinizi qruplaşdırın və dərs cədvəlinizi qurun."
            }
          />
        )}
      </main>
    </>
  );
}
