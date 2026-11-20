import { SkeletonHeader, SkeletonPulse } from "./skeleton-elements";

export function GroupDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Qrup detalları yüklənir" role="status">
      <SkeletonHeader titleWidth="w-32" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Geri linki */}
        <SkeletonPulse className="h-4 w-28" />

        {/* Başlıq Bloku */}
        <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SkeletonPulse className="size-14 rounded-2xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SkeletonPulse className="h-7 w-48" />
                <SkeletonPulse className="h-6 w-16 rounded-full" />
              </div>
              <SkeletonPulse className="h-3.5 w-72" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonPulse className="h-9 w-28 rounded-xl" />
            <SkeletonPulse className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        {/* 3 Stat Card */}
        <section className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <SkeletonPulse className="h-3.5 w-24" />
              <SkeletonPulse className="h-8 w-16" />
              <SkeletonPulse className="h-3 w-32" />
            </div>
          ))}
        </section>

        {/* 2 Sütun: Şagirdlər + Dərslər */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_.9fr]">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <SkeletonPulse className="h-5 w-32" />
              <SkeletonPulse className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <SkeletonPulse className="size-9 rounded-full" />
                    <SkeletonPulse className="h-4 w-32" />
                  </div>
                  <SkeletonPulse className="h-4 w-14" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 space-y-3">
              <SkeletonPulse className="h-5 w-32 pb-2 border-b border-slate-100" />
              <div className="space-y-2">
                <SkeletonPulse className="h-12 rounded-xl" />
                <SkeletonPulse className="h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
