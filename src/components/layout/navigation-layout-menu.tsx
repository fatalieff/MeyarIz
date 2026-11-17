"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, PanelLeft, PanelLeftClose, PanelTop } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavigationLayout = "collapsed" | "open" | "horizontal";
const storageKey = "mathrank-navigation-layout";
const choices: { value: NavigationLayout; title: string; description: string; icon: typeof PanelLeft }[] = [
  { value: "collapsed", title: "Yığılmış şaquli menyu", description: "Yalnız ikonlar; üzərinə gələndə açılır", icon: PanelLeftClose },
  { value: "open", title: "Açıq şaquli menyu", description: "Sidebar həmişə tam açıq qalır", icon: PanelLeft },
  { value: "horizontal", title: "Üfüqi menyu", description: "Menyu yuxarı panelə keçir", icon: PanelTop },
];

function storedLayout(): NavigationLayout {
  const value = typeof document === "undefined" ? null : document.documentElement.dataset.navLayout;
  return value === "collapsed" || value === "horizontal" ? value : "open";
}

export function NavigationLayoutMenu() {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<NavigationLayout>(storedLayout);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const select = (value: NavigationLayout) => {
    setLayout(value);
    document.documentElement.dataset.navLayout = value;
    localStorage.setItem(storageKey, value);
    setOpen(false);
  };

  return <div ref={rootRef} className="relative">
    <button type="button" aria-label="Menyu görünüşünü dəyiş" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)} className={cn("focus-ring flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm font-semibold text-slate-600 shadow-xs transition hover:border-indigo-200 hover:text-indigo-700", open && "border-indigo-300 text-indigo-700 ring-4 ring-indigo-500/10")}>
      <PanelLeft className="size-4"/><span className="hidden xl:inline">Menyu görünüşü</span><ChevronDown className={cn("size-3.5 text-slate-400 transition", open && "rotate-180")}/>
    </button>
    {open&&<div role="menu" aria-label="Menyu görünüşü" className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,.16)] ring-1 ring-slate-900/5">
      <div className="px-3 pb-2 pt-1"><p className="text-xs font-bold text-slate-900">Naviqasiya görünüşü</p><p className="mt-0.5 text-[11px] text-slate-500">İş tərzinizə uyğun menyunu seçin.</p></div>
      {choices.map((choice) => { const Icon=choice.icon;const active=layout===choice.value;return <button key={choice.value} type="button" role="menuitemradio" aria-checked={active} onClick={()=>select(choice.value)} className={cn("flex w-full items-start gap-3 rounded-xl p-3 text-left transition",active?"bg-indigo-50":"hover:bg-slate-50")}><span className={cn("grid size-9 shrink-0 place-items-center rounded-xl",active?"bg-indigo-600 text-white":"bg-slate-100 text-slate-500")}><Icon className="size-4"/></span><span className="min-w-0 flex-1"><strong className={cn("block text-sm",active?"text-indigo-900":"text-slate-800")}>{choice.title}</strong><span className="mt-0.5 block text-xs leading-4 text-slate-500">{choice.description}</span></span>{active&&<Check className="mt-2 size-4 shrink-0 text-indigo-600"/>}</button>;})}
    </div>}
  </div>;
}
