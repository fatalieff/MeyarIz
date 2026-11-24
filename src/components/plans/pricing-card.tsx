"use client";

import { Building2, Check, CircleCheck, Minus, Plus, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/plans";

interface PricingCardProps {
  plan: SubscriptionPlan;
  studentCount?: string;
  onStudentCountChange?: (value: string) => void;
  onStudentCountBlur?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onSelect: () => void;
}

export function PricingCard({
  plan,
  studentCount,
  onStudentCountChange,
  onStudentCountBlur,
  onIncrement,
  onDecrement,
  onSelect,
}: PricingCardProps) {
  const isUltra = plan.id === "ultra";
  const PlanIcon = isUltra ? Building2 : plan.featured ? Sparkles : UserRound;
  const numericStudentCount = Number(studentCount || 0);

  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border bg-white p-5 shadow-[0_10px_35px_-24px_rgba(15,23,42,0.35)] transition duration-300 sm:p-6",
        plan.featured
          ? "border-indigo-300 bg-gradient-to-b from-indigo-50/80 via-white to-white shadow-[0_24px_55px_-28px_rgba(79,70,229,0.48)] hover:-translate-y-1 hover:border-indigo-400 lg:-translate-y-3 lg:scale-[1.035] lg:hover:-translate-y-4"
          : "border-slate-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)]",
      )}
    >
      {plan.featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
      )}

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl",
            plan.featured
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "bg-slate-100 text-slate-600",
          )}
        >
          <PlanIcon className="size-5" />
        </span>
        {plan.current ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Badge tone="success" className="gap-1.5 border-emerald-200 bg-white/90 text-emerald-700">
              <CircleCheck className="size-3.5" />
              Cari plan
            </Badge>
            <Badge tone="brand" className="border-indigo-200 bg-white/90 text-indigo-700">Tövsiyə olunan</Badge>
          </div>
        ) : plan.featured ? (
          <Badge tone="brand" className="border-indigo-200 bg-white/90 text-indigo-700">Tövsiyə olunan</Badge>
        ) : null}
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-950">{plan.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{plan.description}</p>
      </div>

      <div className="mt-6 min-h-[5.25rem]">
        {plan.price !== null ? (
          <div className="flex items-end gap-2">
            <strong className={cn("font-extrabold tracking-[-0.045em] text-slate-950", plan.featured ? "text-4xl sm:text-[2.65rem]" : "text-4xl")}>{plan.priceLabel}</strong>
            <span className="pb-1 text-sm font-semibold text-slate-400">{plan.priceNote}</span>
          </div>
        ) : (
          <div>
            <strong className="block text-3xl font-extrabold tracking-tight text-slate-950">{plan.priceLabel}</strong>
            <span className="mt-1 block text-sm font-semibold text-indigo-600">{plan.priceNote}</span>
          </div>
        )}
      </div>

      <div className={cn("mt-3 rounded-2xl border px-4 py-3", plan.featured ? "border-indigo-200 bg-indigo-50/80" : "border-slate-200 bg-slate-50/80")}>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Şagird tutumu</span>
        <p className={cn("mt-1 text-sm font-bold", plan.featured ? "text-indigo-800" : "text-slate-800")}>{plan.studentLimit}</p>
      </div>

      {isUltra && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <label htmlFor="ultra-student-count" className="text-xs font-bold text-slate-700">Şagird sayı</label>
          <div className="mt-2 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2">
            <button
              type="button"
              aria-label="Şagird sayını azalt"
              disabled={numericStudentCount <= 501}
              onClick={onDecrement}
              className="focus-ring grid size-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <input
              id="ultra-student-count"
              type="number"
              min={501}
              step={1}
              inputMode="numeric"
              value={studentCount}
              onChange={(event) => onStudentCountChange?.(event.target.value)}
              onBlur={onStudentCountBlur}
              className="h-10 min-w-0 w-full px-3 text-center text-sm font-bold text-slate-900"
            />
            <button
              type="button"
              aria-label="Şagird sayını artır"
              onClick={onIncrement}
              className="focus-ring grid size-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Qiymət şagird sayınıza və ehtiyaclarınıza uyğun fərdi olaraq müəyyənləşdirilir.</p>
        </div>
      )}

      <ul className="my-6 space-y-3" aria-label={`${plan.name} imkanları`}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
            <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", plan.featured ? "bg-indigo-100 text-indigo-700" : "bg-emerald-50 text-emerald-700")}>
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className="leading-5">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant={plan.featured ? "primary" : "secondary"}
        onClick={onSelect}
        disabled={plan.current}
        className={cn(
          "mt-auto w-full",
          plan.featured && "shadow-lg shadow-indigo-600/20",
          plan.current && "disabled:cursor-default disabled:bg-emerald-600 disabled:text-white disabled:opacity-100 disabled:shadow-emerald-600/20",
        )}
      >
        {plan.current && <CircleCheck className="size-4" />}
        {plan.current ? "Hazırkı planınız" : plan.cta}
      </Button>
    </article>
  );
}
