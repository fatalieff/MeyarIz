import { cn } from "@/lib/utils";

interface MeyarIzLogoProps { className?: string; size?: number; }

export function MeyarIzLogo({ className, size=44 }: MeyarIzLogoProps) {
  return <div style={{width:size,height:size}} className={cn("relative flex shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-2 text-white shadow-xs",className)}>
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full" aria-hidden="true">
      <circle cx="8" cy="8" r="1" fill="#818cf8" fillOpacity=".55"/><circle cx="36" cy="36" r="1" fill="#818cf8" fillOpacity=".55"/>
      <rect x="9" y="24" width="4.5" height="12" rx="2" fill="#312e81"/><rect x="19.75" y="18" width="4.5" height="18" rx="2" fill="#3730a3"/><rect x="30.5" y="11" width="4.5" height="25" rx="2" fill="#4338ca"/>
      <path d="M9 36V19.5c0-2 2-3.3 3.8-2.4L22 22l9.2-11.2c1.2-1.4 3.6-.6 3.6 1.2v24" stroke="#818cf8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17.5 22 22.5 32 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m33 5 1.2 2.2 2.3 1.3-2.3 1.3L33 12l-1.2-2.2-2.3-1.3 2.3-1.3L33 5Z" fill="#38bdf8"/><circle cx="33" cy="8.5" r="1" fill="white"/>
    </svg>
  </div>;
}

export function MeyarIzWordmark({ className }: { className?: string }) {
  return <span className={cn("font-bold tracking-[-.035em] text-slate-950",className)}>Meyar<span className="text-indigo-600">İZ</span></span>;
}
