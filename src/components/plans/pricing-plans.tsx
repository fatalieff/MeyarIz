"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PricingCard } from "@/components/plans/pricing-card";
import { subscriptionPlans, type PlanId } from "@/lib/plans";

const minimumUltraStudents = 501;

export function PricingPlans() {
  const [studentCount, setStudentCount] = useState("1000");

  const normalizeStudentCount = () => {
    const parsed = Number.parseInt(studentCount, 10);
    setStudentCount(String(Number.isFinite(parsed) ? Math.max(minimumUltraStudents, parsed) : minimumUltraStudents));
  };

  const changeBy = (amount: number) => {
    const parsed = Number.parseInt(studentCount, 10);
    const current = Number.isFinite(parsed) ? parsed : minimumUltraStudents;
    setStudentCount(String(Math.max(minimumUltraStudents, current + amount)));
  };

  const selectPlan = (planId: PlanId) => {
    toast.info(
      planId === "ultra"
        ? "Fərdi abunəlik müraciətləri tezliklə aktiv olacaq."
        : "Abunəlik sistemi tezliklə istifadəyə veriləcək.",
    );
  };

  return (
    <section className="grid min-w-0 gap-5 pt-3 lg:grid-cols-3 lg:items-stretch lg:gap-6 lg:pt-8" aria-label="Abunəlik paketləri">
      {subscriptionPlans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          studentCount={plan.id === "ultra" ? studentCount : undefined}
          onStudentCountChange={plan.id === "ultra" ? setStudentCount : undefined}
          onStudentCountBlur={plan.id === "ultra" ? normalizeStudentCount : undefined}
          onIncrement={plan.id === "ultra" ? () => changeBy(1) : undefined}
          onDecrement={plan.id === "ultra" ? () => changeBy(-1) : undefined}
          onSelect={() => selectPlan(plan.id)}
        />
      ))}
    </section>
  );
}
