import { Inbox,Sparkles } from "lucide-react";

export function EmptyState({title,description}:{title:string;description:string}){
  return <div className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/80 via-white to-indigo-50/40 px-6 text-center"><Sparkles className="absolute right-8 top-8 size-4 text-indigo-200"/><span className="mb-4 grid size-12 place-items-center rounded-2xl border border-white bg-white text-indigo-400 shadow-[0_10px_24px_rgba(31,38,72,.08)]"><Inbox className="size-5"/></span><h3 className="font-semibold text-slate-800">{title}</h3><p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</p></div>;
}
