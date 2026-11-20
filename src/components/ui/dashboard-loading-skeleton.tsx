export function DashboardLoadingSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Səhifə yüklənir" role="status">
      <div className="flex h-20 items-center justify-between border-b border-slate-200/80 bg-white px-5 md:px-8">
        <div className="h-5 w-28 rounded-md bg-slate-200 sm:w-36" />
        <div className="flex gap-2">
          <div className="size-10 rounded-xl bg-slate-100" />
          <div className="size-10 rounded-xl bg-slate-200" />
        </div>
      </div>
      <main className="p-5 md:p-8">
        <div className="h-3 w-32 rounded bg-indigo-100 sm:w-40" />
        <div className="mt-4 h-7 w-56 max-w-full rounded-lg bg-slate-200 sm:h-8 sm:w-72" />
        <div className="mt-3 h-4 w-full max-w-md rounded bg-slate-100" />
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-28 rounded-[1.25rem] border border-slate-200 bg-white p-4 sm:h-32 sm:p-5">
              <div className="h-3 w-16 rounded bg-slate-100 sm:w-24" />
              <div className="mt-5 h-7 w-14 rounded bg-slate-200 sm:h-8 sm:w-20" />
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="h-72 rounded-[1.25rem] border border-slate-200 bg-white p-5 sm:h-80 sm:p-6">
            <div className="h-5 w-36 rounded bg-slate-200 sm:w-40" />
            <div className="mt-3 h-3 w-52 max-w-full rounded bg-slate-100" />
            <div className="mt-8 h-40 rounded-xl bg-slate-50 sm:mt-10 sm:h-44" />
          </div>
          <div className="h-52 rounded-[1.25rem] border border-slate-200 bg-white p-5 sm:p-6">
            <div className="h-5 w-28 rounded bg-slate-200" />
            <div className="mt-5 space-y-3">
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </main>
      <span className="sr-only">Məlumatlar yüklənir...</span>
    </div>
  );
}
