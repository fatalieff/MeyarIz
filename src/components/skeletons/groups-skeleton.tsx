import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function GroupsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Qruplar yüklənir" role="status">
      <SkeletonHeader titleWidth="w-24" />

      <main className="p-5 md:p-8 space-y-7 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={true} />

        {/* 3 KPI Kartı */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonPulse className="h-3.5 w-24" />
                  <SkeletonPulse className="h-8 w-16" />
                </div>
                <SkeletonPulse className="size-12 rounded-2xl" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <SkeletonPulse className="size-2 rounded-full" />
                <SkeletonPulse className="h-3 w-40" />
              </div>
            </div>
          ))}
        </section>

        {/* Toolbar: Tabs + Search */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <SkeletonPulse className="h-9 w-24 rounded-xl" />
            <SkeletonPulse className="h-9 w-24 rounded-xl" />
          </div>
          <SkeletonPulse className="h-10 w-full sm:max-w-xs rounded-xl" />
        </section>

        {/* 6 Qrup Kartı (Grid) */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card relative p-6 space-y-5 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-200" />
              <div className="flex items-start justify-between">
                <SkeletonPulse className="size-12 rounded-2xl" />
                <div className="flex gap-1.5">
                  <SkeletonPulse className="h-6 w-20 rounded-lg" />
                  <SkeletonPulse className="h-6 w-14 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-40" />
                <SkeletonPulse className="h-3.5 w-full" />
                <SkeletonPulse className="h-3.5 w-3/4" />
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <SkeletonPulse className="h-3 w-24" />
                <div className="flex gap-1.5">
                  <SkeletonPulse className="h-6 w-20 rounded-lg" />
                  <SkeletonPulse className="h-6 w-20 rounded-lg" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="size-6 rounded-full" />
                  <SkeletonPulse className="h-3.5 w-16" />
                </div>
                <SkeletonPulse className="h-4 w-20" />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
