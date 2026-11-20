import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function AnalyticsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Analitika yüklənir" role="status">
      <SkeletonHeader titleWidth="w-24" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={false} />

        {/* 3 Stat Card */}
        <section className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonPulse className="h-3.5 w-24" />
                  <SkeletonPulse className="h-8 w-20" />
                </div>
                <SkeletonPulse className="size-12 rounded-2xl" />
              </div>
              <SkeletonPulse className="h-3 w-36" />
            </div>
          ))}
        </section>

        {/* Böyük Chart Kartı */}
        <section className="card p-6 space-y-4">
          <div className="space-y-1.5">
            <SkeletonPulse className="h-5 w-40" />
            <SkeletonPulse className="h-3.5 w-64" />
          </div>

          <div className="pt-6">
            <div className="flex items-end justify-between gap-3 h-64 pt-8">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <SkeletonPulse
                    className="w-full max-w-[48px] rounded-t-lg"
                    style={{ height: `${(i % 3 === 0 ? 70 : i % 2 === 0 ? 85 : 55)}%` }}
                  />
                  <SkeletonPulse className="h-3 w-10" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
