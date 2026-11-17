import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({ label, value, detail, icon: Icon, trend }: { label: string; value: string; detail: string; icon: LucideIcon; trend?: number | null }) {
  return (
    <article className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl border border-slate-200/80 bg-slate-50 text-indigo-600 shadow-xs">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        {trend != null && (trend >= 0 ? <TrendingUp className="size-3.5 text-emerald-600" /> : <TrendingDown className="size-3.5 text-rose-600" />)}
        <span>{detail}</span>
      </div>
    </article>
  );
}
