import { SkeletonHeader, SkeletonPulse } from "./skeleton-elements";

export function StudentDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Şagird profili yüklənir" role="status">
      <SkeletonHeader titleWidth="w-32" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPulse className="h-4 w-28" />

        {/* Profil Header Kartı */}
        <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SkeletonPulse className="size-16 rounded-2xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SkeletonPulse className="h-7 w-48" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
              </div>
              <SkeletonPulse className="h-3.5 w-60" />
            </div>
          </div>
          <SkeletonPulse className="h-9 w-28 rounded-xl" />
        </div>

        {/* 4 Göstərici Kartı */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <SkeletonPulse className="h-3.5 w-24" />
              <SkeletonPulse className="h-8 w-16" />
              <SkeletonPulse className="h-3 w-32" />
            </div>
          ))}
        </section>

        {/* Nəticələr və Qrafik */}
        <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div className="card p-6 space-y-4">
            <SkeletonPulse className="h-5 w-40 pb-3 border-b border-slate-100" />
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="space-y-1">
                    <SkeletonPulse className="h-4 w-36" />
                    <SkeletonPulse className="h-3 w-24" />
                  </div>
                  <SkeletonPulse className="h-6 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <SkeletonPulse className="h-5 w-36 pb-3 border-b border-slate-100" />
            <SkeletonPulse className="h-56 rounded-xl" />
          </div>
        </section>
      </main>
    </div>
  );
}
