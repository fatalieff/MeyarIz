import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const respond = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method !== "POST") return respond({ error: "Yalnız POST sorğusuna icazə verilir." }, 405);
  const authorization = request.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SB_PUBLISHABLE_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authorization || !url || !publishable || !serviceRole) return respond({ error: "Xidmət konfiqurasiyası natamamdır." }, 503);
  const caller = createClient(url, publishable, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const admin = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return respond({ error: "Giriş tələb olunur." }, 401);
  const { data: profile } = await admin.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin" || profile.status !== "active") return respond({ error: "Admin səlahiyyəti tələb olunur." }, 403);
  const payload = await request.json().catch(() => ({}));
  const teacherId = String(payload.teacherId || "");
  const billingModel = String(payload.billingModel || "");
  if (!teacherId || !["CALENDAR_MONTH", "ANNIVERSARY_MONTH", "LESSON_PACKAGE"].includes(billingModel)) return respond({ error: "Müəllim və ödəniş modeli düzgün deyil." }, 400);
  const { data: workspace } = await admin.from("teacher_workspaces").select("id").eq("owner_id", teacherId).maybeSingle();
  if (!workspace) return respond({ error: "Müəllim workspace-i tapılmadı." }, 404);
  const { error } = await admin.from("workspace_billing_settings").insert({ workspace_id: workspace.id, billing_model: billingModel, effective_from: new Date().toISOString().slice(0, 10), created_by: user.id });
  if (error?.code !== "23505" && error) return respond({ error: "Ödəniş modeli saxlanıla bilmədi." }, 500);
  await admin.from("admin_audit_logs").insert({ admin_id: user.id, action: "configure_teacher_billing", target_teacher_id: teacherId, summary: `Workspace ödəniş modeli təyin edildi: ${billingModel}`, status: "success", details: { billingModel } });
  return respond({ ok: true });
});
