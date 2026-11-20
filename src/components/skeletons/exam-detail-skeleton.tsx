import { SkeletonHeader, SkeletonPulse } from "./skeleton-elements";

export function ExamDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Sınaq nəticələri yüklənir" role="status">
      <SkeletonHeader titleWidth="w-32" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPulse className="h-4 w-28" />

        {/* Sınaq Məlumat Kartı */}
        <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-7 w-48" />
              <SkeletonPulse className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-3.5 w-28" />
              <SkeletonPulse className="h-3.5 w-36" />
            </div>
          </div>
          <SkeletonPulse className="h-10 w-36 rounded-xl" />
        </div>

        {/* Şagirdlərin Nəticə Cədvəli */}
        <div className="card overflow-hidden">
          <div className="border-b bg-slate-50/70 p-4 flex items-center justify-between">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-4 w-24" />
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonPulse className="size-9 rounded-full" />
                  <SkeletonPulse className="h-4 w-36" />
                </div>
                <div className="flex items-center gap-3">
                  <SkeletonPulse className="h-10 w-24 rounded-xl" />
                  <SkeletonPulse className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
