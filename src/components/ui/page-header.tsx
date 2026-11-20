import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="max-w-3xl">
        {eyebrow && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100/90 bg-indigo-50/80 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-indigo-700 shadow-2xs">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
