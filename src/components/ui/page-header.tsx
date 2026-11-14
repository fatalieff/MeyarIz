import { ReactNode } from "react";

export function PageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-3xl"><div className="mb-3 flex items-center gap-2"><span className="h-px w-6 bg-indigo-500"/><p className="text-[11px] font-bold uppercase tracking-[.2em] text-indigo-600">{eyebrow}</p></div><h2 className="text-3xl font-bold tracking-[-.04em] text-slate-950 md:text-[2rem]">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div>{action&&<div className="shrink-0">{action}</div>}</div>;
}
