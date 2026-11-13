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
  const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";

  if (!authorization || !supabaseUrl || !publishableKey || !serviceRoleKey) {
    return json({ error: "Dəvət xidməti düzgün konfiqurasiya edilməyib." }, 503);
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

  const { data: student } = await admin
    .from("students")
    .select("id,email,full_name,auth_user_id")
    .eq("id", payload.studentId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!student) {
    return json({ error: "Şagird tapılmadı." }, 404);
  }
  if (!student.email) {
    return json({ error: "Dəvət üçün şagirdin e-poçtu olmalıdır." }, 400);
  }
  if (student.auth_user_id) {
    return json({ ok: true, alreadyInvited: true });
  }

  const { data: invitation, error: invitationError } =
    await admin.auth.admin.inviteUserByEmail(student.email, {
      data: { full_name: student.full_name },
      redirectTo: new URL(
        "/auth/callback?next=/reset-password",
        appUrl,
      ).toString(),
    });

  if (invitationError || !invitation.user) {
    const duplicate = invitationError?.message
      .toLocaleLowerCase("en")
      .includes("already");
    return json(
      {
        error: duplicate
          ? "Bu e-poçtla Supabase istifadəçisi artıq mövcuddur."
          : "Dəvət e-poçtu göndərilə bilmədi.",
      },
      duplicate ? 409 : 400,
    );
  }

  const { error: linkError } = await admin
    .from("students")
    .update({ auth_user_id: invitation.user.id })
    .eq("id", student.id)
    .eq("workspace_id", workspace.id);

  if (linkError) {
    await admin.auth.admin.deleteUser(invitation.user.id);
    return json({ error: "Şagird hesabı profilə bağlana bilmədi." }, 500);
  }

  return json({ ok: true });
});
