import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function ScheduleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Dərs cədvəli yüklənir" role="status">
      <SkeletonHeader titleWidth="w-28" />

      <main className="p-5 md:p-8 space-y-7 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={true} />

        {/* Həftəlik 7 Sütunlu Cədvəl Şəbəkəsi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonPulse className="h-5 w-36" />
            <SkeletonPulse className="h-4 w-48" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
            {["B.e", "Ç.a", "Çər", "C.a", "Cüm", "Şən", "Baz"].map((day, i) => (
              <div key={day} className="card p-3 min-h-[260px] flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">{day}</span>
                  {i === 0 && <SkeletonPulse className="size-2 rounded-full" />}
                </div>

                {/* Dərs slotları */}
                <div className="space-y-2 flex-1">
                  {i % 2 === 0 ? (
                    <>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-2">
                        <SkeletonPulse className="h-4 w-20" />
                        <SkeletonPulse className="h-3 w-16" />
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-2">
                        <SkeletonPulse className="h-4 w-16" />
                        <SkeletonPulse className="h-3 w-14" />
                      </div>
                    </>
                  ) : i === 1 || i === 3 ? (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-2">
                      <SkeletonPulse className="h-4 w-24" />
                      <SkeletonPulse className="h-3 w-16" />
                    </div>
                  ) : (
                    <div className="py-12 flex items-center justify-center">
                      <SkeletonPulse className="h-3 w-16" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
