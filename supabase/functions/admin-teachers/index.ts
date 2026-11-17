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
    return json({ error: "Admin xidməti düzgün konfiqurasiya edilməyib." }, 503);
  }

  const caller = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Zəng edən istifadəçinin JWT-sini yoxla
  const {
    data: { user: callerUser },
    error: callerError,
  } = await caller.auth.getUser();

  if (callerError || !callerUser) {
    return json({ error: "Giriş tələb olunur." }, 401);
  }

  // 2. Server bazasında istifadəçinin 'admin' olduğunu və aktiv olduğunu təsdiqlə
  const { data: adminProfile } = await admin
    .from("profiles")
    .select("id, role, status")
    .eq("id", callerUser.id)
    .maybeSingle();

  if (!adminProfile || adminProfile.role !== "admin" || adminProfile.status !== "active") {
    return json({ error: "Bu əməliyyat üçün aktiv inzibatçı səlahiyyəti tələb olunur." }, 403);
  }

  let payload: Record<string, any>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Sorğu məlumatı düzgün deyil." }, 400);
  }

  const action = payload.action;

  // A) CREATE TEACHER (Rollback dəstəkli atomik əməliyyat)
  if (action === "create-teacher") {
    const fullName = String(payload.fullName || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const workspaceName = String(payload.workspaceName || "").trim();
    const password = String(payload.password || "");
    const status = payload.status === "suspended" ? "suspended" : "active";

    if (!fullName || fullName.length < 2) {
      return json({ error: "Ad və soyad ən azı 2 simvol olmalıdır." }, 400);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Düzgün e-poçt ünvanı daxil edin." }, 400);
    }
    if (!workspaceName || workspaceName.length < 2) {
      return json({ error: "İş sahəsi / kurs adı ən azı 2 simvol olmalıdır." }, 400);
    }
    if (!password || password.length < 8) {
      return json({ error: "Müvəqqəti şifrə ən azı 8 simvol olmalıdır." }, 400);
    }

    // 1. Auth istifadəçisi yarat
    const { data: authCreated, error: createAuthError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
        app_metadata: { role: "teacher" },
      });

    if (createAuthError || !authCreated?.user) {
      const msg =
        createAuthError?.message?.includes("already been registered") ||
        createAuthError?.message?.includes("exists")
          ? "Bu e-poçt ünvanı ilə artıq istifadəçi qeydiyyatdan keçib."
          : "Müəllim üçün Auth hesabı yaradıla bilmədi.";
      return json({ error: msg }, 400);
    }

    const teacherId = authCreated.user.id;

    try {
      // 2. profiles cədvəlini yenilə / yarat
      const { error: profileError } = await admin.from("profiles").upsert({
        id: teacherId,
        role: "teacher",
        full_name: fullName,
        status,
      });
      if (profileError) throw profileError;

      // 3. teacher_workspaces cədvəlinə əlavə et
      const { data: wsData, error: wsError } = await admin
        .from("teacher_workspaces")
        .insert({
          owner_id: teacherId,
          name: workspaceName,
        })
        .select("id")
        .single();
      if (wsError || !wsData) throw wsError || new Error("Workspace yaradıla bilmədi.");

      // 4. teacher_settings cədvəlinə əlavə et
      const { error: settingsError } = await admin
        .from("teacher_settings")
        .insert({
          workspace_id: wsData.id,
        });
      if (settingsError) throw settingsError;

      // 5. Audit log yaz (Şifrə heç vaxt yazılmır!)
      await admin.from("admin_audit_logs").insert({
        admin_id: callerUser.id,
        action: "create_teacher",
        target_teacher_id: teacherId,
        summary: `Yeni müəllim hesabı yaradıldı (${email}, ${workspaceName})`,
        status: "success",
        details: { email, workspaceName, teacherName: fullName, status },
      });

      return json({ ok: true, teacherId });
    } catch (err: any) {
      // ROLLBACK: Əgər hər hansı mərhələ uğursuz olarsa, yaradılmış Auth istifadəçisini dərhal təmizlə
      await admin.auth.admin.deleteUser(teacherId).catch(() => {});
      await admin.from("profiles").delete().eq("id", teacherId).catch(() => {});

      await admin.from("admin_audit_logs").insert({
        admin_id: callerUser.id,
        action: "create_teacher",
        target_teacher_id: null,
        summary: `Müəllim hesabı yaradılarkən xəta baş verdi və geri qaytarıldı: ${email}`,
        status: "failure",
        details: { email, error: err?.message || String(err) },
      });

      return json({ error: "Müəllim hesabı yaradılarkən xəta baş verdi. Əməliyyat təhlükəsiz şəkildə geri qaytarıldı." }, 500);
    }
  }

  // B) UPDATE TEACHER (Ad və Workspace adını redaktə etmək)
  if (action === "update-teacher") {
    const teacherId = String(payload.teacherId || "");
    const fullName = String(payload.fullName || "").trim();
    const workspaceName = String(payload.workspaceName || "").trim();

    if (!teacherId) return json({ error: "Müəllim ID daxil edilməyib." }, 400);
    if (!fullName || fullName.length < 2) return json({ error: "Ad və soyad ən azı 2 simvol olmalıdır." }, 400);
    if (!workspaceName || workspaceName.length < 2) return json({ error: "İş sahəsi adı ən azı 2 simvol olmalıdır." }, 400);

    const { error: pErr } = await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", teacherId)
      .eq("role", "teacher");
    if (pErr) return json({ error: "Müəllim adı yenilənə bilmədi." }, 500);

    const { error: wErr } = await admin
      .from("teacher_workspaces")
      .update({ name: workspaceName })
      .eq("owner_id", teacherId);
    if (wErr) return json({ error: "Workspace adı yenilənə bilmədi." }, 500);

    await admin.from("admin_audit_logs").insert({
      admin_id: callerUser.id,
      action: "update_teacher",
      target_teacher_id: teacherId,
      summary: `Müəllim məlumatları yeniləndi (${fullName}, ${workspaceName})`,
      status: "success",
      details: { fullName, workspaceName },
    });

    return json({ ok: true });
  }

  // C) TOGGLE STATUS (Aktivləşdirmək və ya Dayandırmaq)
  if (action === "toggle-status") {
    const teacherId = String(payload.teacherId || "");
    const targetStatus = payload.status === "suspended" ? "suspended" : "active";

    if (!teacherId) return json({ error: "Müəllim ID daxil edilməyib." }, 400);

    const { error: updErr } = await admin
      .from("profiles")
      .update({ status: targetStatus })
      .eq("id", teacherId)
      .eq("role", "teacher");

    if (updErr) return json({ error: "Status yenilənə bilmədi." }, 500);

    if (targetStatus === "suspended") {
      // Dayandırılmış müəllimin sessiyasını dərhal bağla
      await admin.auth.admin.signOut(teacherId).catch(() => {});
    }

    await admin.from("admin_audit_logs").insert({
      admin_id: callerUser.id,
      action: targetStatus === "suspended" ? "suspend_teacher" : "activate_teacher",
      target_teacher_id: teacherId,
      summary: `Müəllim hesabı ${targetStatus === "suspended" ? "dayandırıldı" : "aktivləşdirildi"}`,
      status: "success",
      details: { status: targetStatus },
    });

    return json({ ok: true, status: targetStatus });
  }

  // D) RESET PASSWORD (Müvəqqəti yeni şifrə təyin etmək)
  if (action === "reset-password") {
    const teacherId = String(payload.teacherId || "");
    const newPassword = String(payload.password || "");

    if (!teacherId) return json({ error: "Müəllim ID daxil edilməyib." }, 400);
    if (!newPassword || newPassword.length < 8) {
      return json({ error: "Şifrə ən azı 8 simvol olmalıdır." }, 400);
    }

    const { error: pwErr } = await admin.auth.admin.updateUserById(teacherId, {
      password: newPassword,
    });

    if (pwErr) {
      return json({ error: "Şifrə yenilənə bilmədi: " + pwErr.message }, 500);
    }

    // Şifrə dərhal dəyişəndən sonra sessiyaları bağla ki, yeni şifrə ilə daxil olsun
    await admin.auth.admin.signOut(teacherId).catch(() => {});

    await admin.from("admin_audit_logs").insert({
      admin_id: callerUser.id,
      action: "reset_teacher_password",
      target_teacher_id: teacherId,
      summary: "Müəllim üçün yeni müvəqqəti şifrə təyin edildi",
      status: "success",
      details: {}, // Şifrə qətiyyən loga yazılmır!
    });

    return json({ ok: true });
  }

  // E) DELETE TEACHER (Təhlükəli silmə və bütün məlumatların kaskad təmizlənməsi)
  if (action === "delete-teacher") {
    const teacherId = String(payload.teacherId || "");
    const confirmation = String(payload.confirmation || "").trim();

    if (!teacherId) return json({ error: "Müəllim ID daxil edilməyib." }, 400);

    // Müəllimi tap
    const { data: teacher } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", teacherId)
      .eq("role", "teacher")
      .maybeSingle();

    if (!teacher) return json({ error: "Müəllim tapılmadı." }, 404);

    if (confirmation !== teacher.full_name && confirmation !== "SİL") {
      return json({ error: "Silmə təsdiq mətni düzgün daxil edilməyib." }, 400);
    }

    // 1. Müəllimin workspace-ini tap
    const { data: ws } = await admin
      .from("teacher_workspaces")
      .select("id")
      .eq("owner_id", teacherId)
      .maybeSingle();

    if (ws) {
      // Əlaqəli məlumatları təmizlə
      const { data: students } = await admin
        .from("students")
        .select("id, auth_user_id")
        .eq("workspace_id", ws.id);

      const studentIds = (students || []).map((s) => s.id);
      const studentAuthIds = (students || [])
        .map((s) => s.auth_user_id)
        .filter(Boolean) as string[];

      if (studentIds.length > 0) {
        await admin.from("student_achievements").delete().in("student_id", studentIds);
        await admin.from("exam_results").delete().in("student_id", studentIds);
        await admin.from("parent_contacts").delete().in("student_id", studentIds);
        await admin.from("group_memberships").delete().in("student_id", studentIds);
        await admin.from("students").delete().eq("workspace_id", ws.id);

        // Şagird auth hesablarını da təmizlə
        for (const authId of studentAuthIds) {
          await admin.auth.admin.deleteUser(authId).catch(() => {});
        }
      }

      const { data: groups } = await admin
        .from("groups")
        .select("id")
        .eq("workspace_id", ws.id);

      const groupIds = (groups || []).map((g) => g.id);
      if (groupIds.length > 0) {
        await admin.from("group_schedules").delete().in("group_id", groupIds);
        await admin.from("examinations").delete().in("group_id", groupIds);
        await admin.from("groups").delete().eq("workspace_id", ws.id);
      }

      await admin.from("examination_templates").delete().eq("workspace_id", ws.id);
      await admin.from("teacher_settings").delete().eq("workspace_id", ws.id);
      await admin.from("teacher_workspaces").delete().eq("id", ws.id);
    }

    await admin.from("profiles").delete().eq("id", teacherId);
    await admin.auth.admin.deleteUser(teacherId);

    // Audit log
    await admin.from("admin_audit_logs").insert({
      admin_id: callerUser.id,
      action: "delete_teacher",
      target_teacher_id: null,
      summary: `Müəllim hesabı və bütün əlaqəli məlumatları silindi (${teacher.full_name}, ID: ${teacherId})`,
      status: "success",
      details: { deletedTeacherId: teacherId, deletedTeacherName: teacher.full_name },
    });

    return json({ ok: true });
  }

  return json({ error: "Bilinməyən əməliyyat növü." }, 400);
});
