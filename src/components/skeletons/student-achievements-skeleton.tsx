import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function StudentAchievementsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Nailiyyətlər yüklənir" role="status">
      <SkeletonHeader titleWidth="w-28" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={false} />

        {/* 6 Nailiyyət Nişan Kartı */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card p-6 space-y-4">
              <SkeletonPulse className="size-12 rounded-xl" />
              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-36" />
                <SkeletonPulse className="h-3.5 w-full" />
                <SkeletonPulse className="h-3.5 w-4/5" />
              </div>
              <SkeletonPulse className="h-3 w-32 pt-2" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
