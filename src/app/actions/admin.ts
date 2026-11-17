"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createTeacherSchema,
  updateTeacherSchema,
  resetTeacherPasswordSchema,
  toggleTeacherStatusSchema,
  deleteTeacherSchema,
} from "@/lib/validations/schemas";
import { requireRole } from "@/lib/auth/session";

type ActionResult = {
  ok?: boolean;
  message?: string;
  error?: string;
  teacherId?: string;
};

function friendly(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("23505") || err.message.includes("already been registered")) {
      return "Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.";
    }
    return err.message;
  }
  return "Gözlənilməz xəta baş verdi.";
}

export async function createTeacher(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = createTeacherSchema.parse(Object.fromEntries(formData));

    const supabase = await createClient();
    if (!supabase) return { error: "Supabase bağlantısı qurulmayıb." };

    // Edge Function çağırışı
    const { data, error } = await supabase.functions.invoke("admin-teachers", {
      body: {
        action: "create-teacher",
        fullName: parsed.fullName,
        email: parsed.email,
        workspaceName: parsed.workspaceName,
        password: parsed.password,
        status: parsed.status,
      },
    });

    if (error) {
      throw new Error(error.message || "Müəllim hesabı yaradıla bilmədi.");
    }
    if (!data?.ok) {
      throw new Error(data?.error || "Müəllim hesabı yaradıla bilmədi.");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    return { ok: true, message: "Müəllim hesabı və iş sahəsi uğurla yaradıldı.", teacherId: data.teacherId };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function updateTeacher(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = updateTeacherSchema.parse(Object.fromEntries(formData));

    const supabase = await createClient();
    if (!supabase) return { error: "Supabase bağlantısı qurulmayıb." };

    const { data, error } = await supabase.functions.invoke("admin-teachers", {
      body: {
        action: "update-teacher",
        teacherId: parsed.teacherId,
        fullName: parsed.fullName,
        workspaceName: parsed.workspaceName,
      },
    });

    if (error || !data?.ok) {
      throw new Error(data?.error || error?.message || "Müəllim məlumatları yenilənə bilmədi.");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${parsed.teacherId}`);
    return { ok: true, message: "Müəllim məlumatları uğurla yeniləndi." };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function toggleTeacherStatus(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = toggleTeacherStatusSchema.parse(Object.fromEntries(formData));

    const supabase = await createClient();
    if (!supabase) return { error: "Supabase bağlantısı qurulmayıb." };

    const { data, error } = await supabase.functions.invoke("admin-teachers", {
      body: {
        action: "toggle-status",
        teacherId: parsed.teacherId,
        status: parsed.status,
      },
    });

    if (error || !data?.ok) {
      throw new Error(data?.error || error?.message || "Status yenilənə bilmədi.");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${parsed.teacherId}`);
    return {
      ok: true,
      message: `Müəllim hesabı ${parsed.status === "suspended" ? "dayandırıldı" : "aktivləşdirildi"}.`,
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function resetTeacherPassword(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = resetTeacherPasswordSchema.parse(Object.fromEntries(formData));

    const supabase = await createClient();
    if (!supabase) return { error: "Supabase bağlantısı qurulmayıb." };

    const { data, error } = await supabase.functions.invoke("admin-teachers", {
      body: {
        action: "reset-password",
        teacherId: parsed.teacherId,
        password: parsed.password,
      },
    });

    if (error || !data?.ok) {
      throw new Error(data?.error || error?.message || "Şifrə yenilənə bilmədi.");
    }

    revalidatePath(`/admin/teachers/${parsed.teacherId}`);
    revalidatePath("/admin/audit-logs");
    return { ok: true, message: "Yeni müvəqqəti şifrə uğurla təyin edildi." };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function deleteTeacher(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = deleteTeacherSchema.parse(Object.fromEntries(formData));

    const supabase = await createClient();
    if (!supabase) return { error: "Supabase bağlantısı qurulmayıb." };

    const { data, error } = await supabase.functions.invoke("admin-teachers", {
      body: {
        action: "delete-teacher",
        teacherId: parsed.teacherId,
        confirmation: parsed.confirmation,
      },
    });

    if (error || !data?.ok) {
      throw new Error(data?.error || error?.message || "Müəllim hesabı silinə bilmədi.");
    }
  } catch (e) {
    return { error: friendly(e) };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}
