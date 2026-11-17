import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function FormPanel({title,children}:{title:string;children:ReactNode}){
  return <section className="card relative z-10 mb-7 overflow-visible p-5 sm:p-7"><div className="absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-[1.5rem] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"/><div className="mb-6 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"><Sparkles className="size-4"/></span><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">Məlumatları doldurun və yadda saxlayın.</p></div></div>{children}</section>;
}
