import { getTeacherSessionContext } from "@/lib/auth/session";

export async function getPaymentsData() {
  const context = await getTeacherSessionContext();
  if (!context) return null;
  const { supabase, workspace } = context;
  const [invoices, payments, students, groups, pauses, settings] = await Promise.all([
    supabase.from("invoices").select("*,students(full_name),groups(name),payment_allocations(amount_cents,payment_id)").eq("workspace_id", workspace.id).order("period_start", { ascending: false }),
    supabase.from("payments").select("*,students(full_name),payment_allocations(amount_cents,invoice_id)").eq("workspace_id", workspace.id).is("voided_at", null).order("received_at", { ascending: false }),
    supabase.from("students").select("id,full_name,status,group_memberships!inner(active,groups(id,name))").eq("workspace_id", workspace.id).eq("group_memberships.active", true).order("full_name"),
    supabase.from("groups").select("id,name,price_cents,package_lesson_count").eq("workspace_id", workspace.id).eq("status", "active").order("name"),
    supabase.from("student_pauses").select("*,students(full_name)").eq("workspace_id", workspace.id).order("starts_on", { ascending: false }),
    supabase.from("workspace_billing_settings").select("*").eq("workspace_id", workspace.id).is("effective_to", null).maybeSingle(),
  ]);
  const error = [invoices.error, payments.error, students.error, groups.error, pauses.error, settings.error].find(Boolean);
  if (error) throw new Error("Ödəniş məlumatları yüklənə bilmədi.", { cause: error });
  return { invoices: invoices.data || [], payments: payments.data || [], students: students.data || [], groups: groups.data || [], pauses: pauses.data || [], settings: settings.data };
}
