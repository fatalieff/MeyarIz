import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pauseSchema } from "@/lib/validations/payments";

const root = process.cwd();
const ui = readFileSync(resolve(root, "src/components/payments/payment-forms.tsx"), "utf8");
const migration = readFileSync(resolve(root, "supabase/migrations/20261123131500_remove_paid_pause.sql"), "utf8");
const billingMigration = readFileSync(resolve(root, "supabase/migrations/20261123125500_skip_unpriced_invoices.sql"), "utf8");

const validPause = {
  studentId: "00000000-0000-4000-8000-000000000001",
  startsOn: "2026-11-23",
  endsOn: "",
  reason: "Tətil fasiləsi",
};

describe("pause validation and UI", () => {
  it("UI-da ödənişli fasilə seçimini göstərmir", () => {
    expect(ui).not.toContain('value="PAID"');
    expect(ui).not.toContain("Ödənişli fasilə");
  });

  it.each(["UNPAID", "COMPENSATED"])("%s fasiləsini qəbul edir", (kind) => {
    expect(pauseSchema.safeParse({ ...validPause, kind }).success).toBe(true);
  });

  it("saxtalaşdırılmış PAID dəyərini rədd edir", () => {
    expect(pauseSchema.safeParse({ ...validPause, kind: "PAID" }).success).toBe(false);
  });
});

describe("pause database safeguards", () => {
  it("PAID tarixçəsi olduqda migration-ı dayandırır və enumu təhlükəsiz əvəz edir", () => {
    expect(migration).toContain("where kind::text = 'PAID'");
    expect(migration).toContain("raise exception using");
    expect(migration).toContain("create type public.pause_kind_v2 as enum ('UNPAID', 'COMPENSATED')");
    expect(migration).toContain("using kind::text::public.pause_kind_v2");
  });

  it("RPC workspace sahiblik yoxlamasını və məhdud icranı qoruyur", () => {
    expect(migration).toContain("private.is_teacher_of_workspace(ws)");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("grant execute on function public.set_student_pause");
  });

  it("yalnız UNPAID fasilədə gələcək invoice yaradılmasını saxlayır", () => {
    expect(billingMigration).toContain("kind='UNPAID'");
    expect(billingMigration).not.toContain("COMPENSATED");
  });
});
