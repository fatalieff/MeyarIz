import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function StudentsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Şagirdlər yüklənir" role="status">
      <SkeletonHeader titleWidth="w-24" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={true} />

        {/* Search Bar */}
        <div className="card p-3 flex gap-3">
          <SkeletonPulse className="h-10 flex-1 rounded-xl" />
          <SkeletonPulse className="h-10 w-24 rounded-xl" />
        </div>

        {/* Table Card */}
        <div className="card overflow-hidden">
          <div className="border-b bg-slate-50/70 p-4 flex items-center justify-between">
            <SkeletonPulse className="h-4 w-28" />
            <SkeletonPulse className="h-4 w-16" />
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                {/* Şagird Avatar + Ad */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <SkeletonPulse className="size-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <SkeletonPulse className="h-4 w-32" />
                    <SkeletonPulse className="h-3 w-20" />
                  </div>
                </div>

                {/* Qrup Badge */}
                <SkeletonPulse className="hidden md:block h-6 w-24 rounded-full" />

                {/* Əlaqə */}
                <div className="hidden lg:block space-y-1.5 w-36">
                  <SkeletonPulse className="h-3 w-28" />
                  <SkeletonPulse className="h-3 w-20" />
                </div>

                {/* Hesab Statusu */}
                <SkeletonPulse className="h-6 w-20 rounded-full" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="h-8 w-16 rounded-lg" />
                  <SkeletonPulse className="size-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
