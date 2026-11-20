import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function RankingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Reytinq yüklənir" role="status">
      <SkeletonHeader titleWidth="w-28" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={false} />

        {/* Reytinq Cədvəli */}
        <div className="card overflow-hidden">
          <div className="border-b bg-slate-50/70 p-4 flex items-center justify-between">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-4 w-20" />
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                {/* Yer nişanı */}
                <div className="flex items-center gap-4">
                  <div
                    className={`grid size-9 place-items-center rounded-xl font-bold animate-pulse ${
                      i === 0
                        ? "bg-amber-100"
                        : i === 1
                        ? "bg-slate-200"
                        : i === 2
                        ? "bg-orange-100"
                        : "bg-slate-100"
                    }`}
                  />
                  <div className="space-y-1">
                    <SkeletonPulse className="h-4 w-36" />
                    <SkeletonPulse className="h-3 w-20 sm:hidden" />
                  </div>
                </div>

                {/* Qrup */}
                <SkeletonPulse className="hidden sm:block h-6 w-24 rounded-full" />

                {/* Sınaq Sayı */}
                <SkeletonPulse className="hidden md:block h-4 w-16" />

                {/* Reytinq Balı */}
                <div className="text-right space-y-1">
                  <SkeletonPulse className="h-5 w-16 ml-auto" />
                  <SkeletonPulse className="h-2 w-20 ml-auto rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
