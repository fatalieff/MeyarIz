export default function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Səhifə yüklənir" role="status">
      <div className="flex h-20 items-center border-b border-slate-200/80 bg-white px-5 md:px-8">
        <div className="h-5 w-32 rounded-md bg-slate-200" />
      </div>
      <div className="p-5 md:p-8">
        <div className="h-3 w-40 rounded bg-indigo-100" />
        <div className="mt-4 h-8 w-72 max-w-full rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-[28rem] max-w-full rounded bg-slate-100" />
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-32 rounded-[1.25rem] border border-slate-200 bg-white p-5">
              <div className="h-3 w-24 rounded bg-slate-100" />
              <div className="mt-5 h-8 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="mt-6 h-80 rounded-[1.25rem] border border-slate-200 bg-white p-6">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-64 max-w-full rounded bg-slate-100" />
          <div className="mt-10 h-44 rounded-xl bg-slate-50" />
        </div>
      </div>
      <span className="sr-only">Məlumatlar yüklənir...</span>
    </div>
  );
}
