import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
      <span className="mb-3 grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-xs">
        <Inbox className="size-5" />
      </span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
