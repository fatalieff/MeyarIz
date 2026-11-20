import {
  SkeletonHeader,
  SkeletonPageHeader,
  SkeletonPulse,
} from "./skeleton-elements";

export function SettingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Tənzimləmələr yüklənir" role="status">
      <SkeletonHeader titleWidth="w-28" />

      <main className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <SkeletonPageHeader hasButton={false} />

        {/* 2 Forma Kartı */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Profil Formu */}
          <div className="card p-6 space-y-5">
            <div className="space-y-1">
              <SkeletonPulse className="h-5 w-36" />
              <SkeletonPulse className="h-3.5 w-60" />
            </div>

            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <SkeletonPulse className="h-3 w-28" />
                <SkeletonPulse className="h-10 w-full rounded-xl" />
              </div>
              <SkeletonPulse className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          {/* Reytinq Parametrləri Formu */}
          <div className="card p-6 space-y-5">
            <div className="space-y-1">
              <SkeletonPulse className="h-5 w-44" />
              <SkeletonPulse className="h-3.5 w-64" />
            </div>

            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <SkeletonPulse className="h-3 w-24" />
                <SkeletonPulse className="h-10 w-full rounded-xl" />
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="space-y-1">
                  <SkeletonPulse className="h-4 w-36" />
                  <SkeletonPulse className="h-3 w-48" />
                </div>
                <SkeletonPulse className="size-6 rounded-md" />
              </div>
              <SkeletonPulse className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
