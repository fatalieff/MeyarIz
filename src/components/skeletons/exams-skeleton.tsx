import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function ExamsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Sınaqlar yüklənir" role="status">
      <SkeletonHeader titleWidth="w-24" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={true} />

        {/* Filtr və Axtarış Kartı */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="size-9 rounded-xl" />
              <div className="space-y-1">
                <SkeletonPulse className="h-4 w-28" />
                <SkeletonPulse className="h-3 w-44" />
              </div>
            </div>
            <SkeletonPulse className="h-7 w-24 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonPulse key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        </div>

        {/* 6 Sınaq Kartı Grid-i */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <SkeletonPulse className="size-11 rounded-xl" />
                <div className="text-right space-y-1.5">
                  <SkeletonPulse className="h-7 w-16 ml-auto" />
                  <SkeletonPulse className="h-5 w-24 rounded-full ml-auto" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <SkeletonPulse className="h-5 w-48" />
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="size-2 rounded-full" />
                  <SkeletonPulse className="h-3.5 w-24" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <SkeletonPulse className="h-3.5 w-28" />
                <SkeletonPulse className="h-3.5 w-24" />
              </div>

              <div className="flex justify-end">
                <SkeletonPulse className="h-4 w-24" />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
