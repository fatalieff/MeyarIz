import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function StudentResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Nəticələr yüklənir" role="status">
      <SkeletonHeader titleWidth="w-36" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={false} />

        {/* Nəticələr Cədvəli */}
        <div className="card overflow-hidden">
          <div className="border-b bg-slate-50/70 p-4 flex items-center justify-between">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-4 w-20" />
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <SkeletonPulse className="h-4 w-44" />
                  <SkeletonPulse className="h-3 w-28" />
                </div>
                <div className="flex items-center gap-6">
                  <SkeletonPulse className="hidden sm:block h-4 w-24" />
                  <SkeletonPulse className="h-8 w-16 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
