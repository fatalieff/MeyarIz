import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({className,variant="primary",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"primary"|"secondary"|"ghost"|"danger"}){
  return <button className={cn("focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",variant==="primary"&&"bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_10px_24px_rgba(79,70,229,.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(79,70,229,.28)]",variant==="secondary"&&"border border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700",variant==="ghost"&&"text-slate-600 hover:bg-slate-100/80",variant==="danger"&&"bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/15 hover:-translate-y-0.5",className)} {...props}/>;
}
