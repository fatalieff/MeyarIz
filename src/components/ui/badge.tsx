import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({children,tone="neutral",className}:{children:ReactNode;tone?:"neutral"|"success"|"warning"|"danger"|"brand";className?:string}){
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm",tone==="neutral"&&"border-slate-200 bg-white text-slate-600",tone==="success"&&"border-emerald-100 bg-emerald-50 text-emerald-700",tone==="warning"&&"border-amber-100 bg-amber-50 text-amber-700",tone==="danger"&&"border-rose-100 bg-rose-50 text-rose-700",tone==="brand"&&"border-indigo-100 bg-indigo-50 text-indigo-700",className)}>{children}</span>;
}
