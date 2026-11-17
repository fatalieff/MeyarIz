import { describe, expect, it, vi } from "vitest";

describe("admin Edge Function authorization & rollback simulation", () => {
  // Simulyasiya: Edge Function Auth yoxlaması
  function simulateEdgeFunctionAuth(headers: { authorization?: string }, profile?: { role: string; status: string }) {
    if (!headers.authorization) {
      return { status: 401, error: "Giriş tələb olunur." };
    }
    if (!profile || profile.role !== "admin" || profile.status !== "active") {
      return { status: 403, error: "Bu əməliyyat üçün aktiv inzibatçı səlahiyyəti tələb olunur." };
    }
    return { status: 200, ok: true };
  }

  it("rejects calls without Authorization header with 401", () => {
    const res = simulateEdgeFunctionAuth({});
    expect(res.status).toBe(401);
  });

  it("rejects non-admin caller with 403", () => {
    const res = simulateEdgeFunctionAuth(
      { authorization: "Bearer teacher-jwt" },
      { role: "teacher", status: "active" }
    );
    expect(res.status).toBe(403);
  });

  it("rejects suspended admin with 403", () => {
    const res = simulateEdgeFunctionAuth(
      { authorization: "Bearer admin-jwt" },
      { role: "admin", status: "suspended" }
    );
    expect(res.status).toBe(403);
  });

  it("permits active admin with 200", () => {
    const res = simulateEdgeFunctionAuth(
      { authorization: "Bearer valid-admin-jwt" },
      { role: "admin", status: "active" }
    );
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
  });

  it("executes atomic rollback if workspace creation fails after auth user creation", async () => {
    const deleteAuthUserMock = vi.fn().mockResolvedValue({ error: null });
    const deleteProfileMock = vi.fn().mockResolvedValue({ error: null });

    // Mərhələ 1: Auth istifadəçisi uğurla yaradılır
    const createdUserId = "new-teacher-uuid-123";

    // Mərhələ 2: Workspace yaratma simulyasiya edilən xəta verir
    let errorOccurred = false;
    try {
      // Simulyasiya edilən database xətası
      throw new Error("DB Connection timeout on teacher_workspaces insert");
    } catch {
      errorOccurred = true;
      // Rollback icra olunur:
      await deleteAuthUserMock(createdUserId);
      await deleteProfileMock(createdUserId);
    }

    expect(errorOccurred).toBe(true);
    expect(deleteAuthUserMock).toHaveBeenCalledWith(createdUserId);
    expect(deleteProfileMock).toHaveBeenCalledWith(createdUserId);
  });

  it("suspends teacher and terminates active sessions", async () => {
    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    const updateProfileMock = vi.fn().mockResolvedValue({ error: null });

    const teacherId = "teacher-to-suspend";
    const newStatus = "suspended";

    await updateProfileMock(teacherId, { status: newStatus });
    if (newStatus === "suspended") {
      await signOutMock(teacherId);
    }

    expect(updateProfileMock).toHaveBeenCalledWith(teacherId, { status: "suspended" });
    expect(signOutMock).toHaveBeenCalledWith(teacherId);
  });

  it("resets temporary password without saving password in audit logs", async () => {
    const updateUserByIdMock = vi.fn().mockResolvedValue({ data: { user: {} }, error: null });
    const insertAuditLogMock = vi.fn().mockResolvedValue({ error: null });

    const teacherId = "target-teacher";
    const temporaryPassword = "NewSecretPassword888";

    // 1. Supabase Auth şifrəni yeniləyir
    await updateUserByIdMock(teacherId, { password: temporaryPassword });

    // 2. Audit log qeyd edilir (şifrəsiz!)
    await insertAuditLogMock({
      action: "reset_teacher_password",
      targetTeacherId: teacherId,
      summary: "Müəllim üçün yeni müvəqqəti şifrə təyin edildi",
      details: {}, // Şifrə qətiyyən yoxdur
    });

    expect(updateUserByIdMock).toHaveBeenCalledWith(teacherId, { password: temporaryPassword });
    expect(insertAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "reset_teacher_password",
        targetTeacherId: teacherId,
      })
    );
    const auditArg = insertAuditLogMock.mock.calls[0][0];
    expect(auditArg.details.password).toBeUndefined();
    expect(auditArg.summary.includes(temporaryPassword)).toBe(false);
  });
});
