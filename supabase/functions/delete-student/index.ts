import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Yalnız POST sorğusuna icazə verilir." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SB_PUBLISHABLE_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!authorization || !supabaseUrl || !publishableKey || !serviceRoleKey) {
    return json({ error: "Silmə xidməti düzgün konfiqurasiya edilməyib." }, 503);
  }

  const caller = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await caller.auth.getUser();

  if (userError || !user) {
    return json({ error: "Giriş tələb olunur." }, 401);
  }

  let payload: { studentId?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Sorğu məlumatı düzgün deyil." }, 400);
  }

  if (typeof payload.studentId !== "string") {
    return json({ error: "Şagird identifikatoru düzgün deyil." }, 400);
  }

  const { data: workspace } = await admin
    .from("teacher_workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) {
    return json({ error: "Bu əməliyyat üçün müəllim icazəsi tələb olunur." }, 403);
  }

  const { data: deleted, error: deleteError } = await admin.rpc(
    "delete_student_account",
    {
      target_student_id: payload.studentId,
      target_workspace_id: workspace.id,
    },
  );

  if (deleteError) {
    return json({ error: "Şagird hesabı silinə bilmədi." }, 400);
  }
  if (!deleted) {
    return json({ error: "Şagird tapılmadı." }, 404);
  }

  return json({ ok: true });
});
