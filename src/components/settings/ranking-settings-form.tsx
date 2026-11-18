"use client";

import { useActionState } from "react";
import { updateRankingSettings } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import type { RankingPeriod } from "@/lib/calculations/ranking-period";

const periodOptions = [
  { value: "last_3", label: "Son 3 sınaq" },
  { value: "month", label: "Cari ay" },
  { value: "all", label: "Bütün dövr" },
];

export function RankingSettingsForm({
  defaultRankingPeriod,
  globalRankingVisible,
}: {
  defaultRankingPeriod: RankingPeriod;
  globalRankingVisible: boolean;
}) {
  const [state, action, pending] = useActionState(updateRankingSettings, null);

  return (
    <form action={action} className="card p-6">
      <h3 className="font-bold">Reytinq seçimləri</h3>
      <p className="mt-1 text-sm text-slate-500">
        Seçilən dövr reytinq balına, orta göstəricilərə və performans
        qrafiklərinə tətbiq olunur.
      </p>
      <div className="mt-5 space-y-4">
        <div className="space-y-2 text-sm font-semibold">
          Standart dövr
          <CustomSelect
            name="defaultRankingPeriod"
            ariaLabel="Standart reytinq dövrü"
            defaultValue={defaultRankingPeriod}
            options={periodOptions}
            required
          />
        </div>
        <label className="flex items-center justify-between gap-4 rounded-xl border p-3 text-sm font-medium">
          <span>
            Ümumi reytinq şagirdlərə görünsün
            <small className="mt-0.5 block font-normal text-slate-500">
              Söndürüləndə şagird hesabları reytinq siyahısına giriş əldə etmir.
            </small>
          </span>
          <input
            className="size-4 shrink-0 accent-indigo-600"
            name="globalRankingVisible"
            type="checkbox"
            defaultChecked={globalRankingVisible}
          />
        </label>
        <label className="block text-sm font-semibold">
          Saat qurşağı
          <input
            className="mt-2 h-11 w-full rounded-xl border px-3"
            value="Asia/Baku"
            readOnly
          />
        </label>
        {state?.error ? (
          <p
            aria-live="polite"
            className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
          >
            {state.error}
          </p>
        ) : state?.ok ? (
          <p
            aria-live="polite"
            className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {state.message}
          </p>
        ) : null}
        <Button disabled={pending}>
          {pending ? "Tətbiq edilir..." : "Seçimləri saxla"}
        </Button>
      </div>
    </form>
  );
}
