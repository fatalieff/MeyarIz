import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({className,variant="primary",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"primary"|"secondary"|"ghost"|"danger"}){
  return <button className={cn("focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    variant==="primary"&&"bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm",
    variant==="secondary"&&"border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300",
    variant==="ghost"&&"text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    variant==="danger"&&"bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm",
    className)} {...props}/>;
}
