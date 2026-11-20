"use server";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  bakuDateTime,
  nextScheduleOccurrenceDate,
  weekDays,
  weekdayFromDate,
} from "@/lib/calculations/schedules";
import { notifyGroup, notifyStudents } from "@/lib/notifications/server";
import { classifyResultChanges } from "@/lib/notifications/result-changes";
import { buildExamNotificationBody, formatAzDate } from "@/lib/notifications/exam";
import {
  examSchema,
  groupIdSchema,
  groupSchema,
  rankingSettingsSchema,
  resultSchema,
  scheduleSchema,
  studentIdSchema,
  studentSchema,
  studentUpdateSchema,
  teacherProfileSchema,
} from "@/lib/validations/schemas";
type Result = { ok?: true; error?: string; message?: string; warning?: string };
async function context() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase bağlantısı qurulmayıb.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessiya bitib.");
  const { data: workspace } = await supabase
    .from("teacher_workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!workspace) throw new Error("İş sahəsi tapılmadı.");
  return { supabase, workspaceId: workspace.id, user };
}
const friendly = (error: unknown) =>
  error instanceof ZodError
    ? error.issues[0]?.message || "Məlumatları düzgün doldurun."
    : error instanceof Error
      ? error.message
      : "Əməliyyat tamamlanmadı. Yenidən cəhd edin.";
type ParentContactInput = {
  motherName?: string;
  motherPhone?: string;
  fatherName?: string;
  fatherPhone?: string;
};
type ParentContactRow = {
  student_id: string;
  contact_type: "mother" | "father";
  full_name: string | null;
  phone: string | null;
};
const parentContacts = (
  studentId: string,
  input: ParentContactInput,
): ParentContactRow[] => [
  {
    student_id: studentId,
    contact_type: "mother",
    full_name: input.motherName || null,
    phone: input.motherPhone || null,
  },
  {
    student_id: studentId,
    contact_type: "father",
    full_name: input.fatherName || null,
    phone: input.fatherPhone || null,
  },
];
export async function updateTeacherProfile(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const input = teacherProfileSchema.parse(Object.fromEntries(formData));
    const { supabase, workspaceId, user } = await context();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: input.fullName })
      .eq("id", user.id)
      .select("id")
      .single();
    if (profileError || !profile)
      throw new Error("Ad və soyad yenilənə bilmədi.");
    const { data: workspace, error: workspaceError } = await supabase
      .from("teacher_workspaces")
      .update({ name: input.workspaceName })
      .eq("id", workspaceId)
      .select("id")
      .single();
    if (workspaceError || !workspace)
      throw new Error("İş sahəsinin adı yenilənə bilmədi.");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Profil məlumatları Supabase-də yeniləndi." };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function updateRankingSettings(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const input = rankingSettingsSchema.parse(Object.fromEntries(formData));
    const { supabase, workspaceId } = await context();
    const { data, error } = await supabase
      .from("teacher_settings")
      .update({
        default_ranking_period: input.defaultRankingPeriod,
        global_ranking_visible: input.globalRankingVisible,
      })
      .eq("workspace_id", workspaceId)
      .select("workspace_id")
      .single();
    if (error || !data) throw new Error("Reytinq seçimləri saxlanıla bilmədi.");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/student", "layout");
    return {
      ok: true,
      message: "Reytinq seçimləri tətbiq edildi və hesablamalar yeniləndi.",
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function createGroup(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const input = groupSchema.parse(Object.fromEntries(formData));
    const { supabase, workspaceId } = await context();
    const { error } = await supabase
      .from("groups")
      .insert({
        workspace_id: workspaceId,
        name: input.name,
        description: input.description || null,
        preparation_level: input.preparationLevel || null,
        color: input.color,
      });
    if (error)
      throw new Error(
        error.code === "23505"
          ? "Bu adda qrup artıq mövcuddur."
          : "Qrup yaradıla bilmədi.",
      );
    revalidatePath("/dashboard/groups");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function updateGroup(
  groupId: string,
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const id = groupIdSchema.parse(groupId);
    const input = groupSchema.parse(Object.fromEntries(formData));
    const { supabase, workspaceId } = await context();
    const { data, error } = await supabase
      .from("groups")
      .update({
        name: input.name,
        description: input.description || null,
        preparation_level: input.preparationLevel || null,
        color: input.color,
      })
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select("id")
      .single();
    if (error || !data)
      throw new Error(
        error?.code === "23505"
          ? "Bu adda qrup artıq mövcuddur."
          : "Qrup məlumatları yenilənə bilmədi.",
      );
    revalidatePath("/dashboard/groups");
    revalidatePath(`/dashboard/groups/${id}`);
    revalidatePath("/dashboard/students");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/exams");
    revalidatePath("/dashboard/rankings");
    revalidatePath("/dashboard");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/schedule");
    return { ok: true, message: "Qrup məlumatları uğurla yeniləndi." };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function updateGroupStatus(
  id: string,
  status: "active" | "archived",
) {
  const { supabase } = await context();
  await supabase.from("groups").update({ status }).eq("id", id);
  revalidatePath("/dashboard/groups");
}
export async function deleteGroup(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const groupId = groupIdSchema.parse(String(formData.get("groupId") || ""));
    const { supabase, workspaceId } = await context();

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, name")
      .eq("id", groupId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (groupError || !group)
      throw new Error("Qrup tapılmadı və ya silinmə icazəsi yoxdur.");

    // 1. Qrupa aid sınaqları və əlaqəli nəticələri təmizlə
    const { data: exams } = await supabase
      .from("examinations")
      .select("id")
      .eq("group_id", groupId);

    const examIds = (exams || []).map((e: any) => e.id);
    if (examIds.length > 0) {
      await supabase
        .from("student_achievements")
        .delete()
        .in("examination_id", examIds);
      await supabase
        .from("exam_results")
        .delete()
        .in("examination_id", examIds);
      await supabase.from("examinations").delete().in("id", examIds);
    }

    // 2. Qrup üzvlüklərini və dərs cədvəllərini sil
    await supabase.from("group_memberships").delete().eq("group_id", groupId);
    await supabase.from("group_schedules").delete().eq("group_id", groupId);

    // 3. Qrupun özünü sil
    const { error: delError } = await supabase
      .from("groups")
      .delete()
      .eq("id", groupId)
      .eq("workspace_id", workspaceId);

    if (delError)
      throw new Error("Qrup silinərkən xəta baş verdi: " + delError.message);
  } catch (e) {
    return { error: friendly(e) };
  }

  revalidatePath("/dashboard/groups");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/schedule");
  revalidatePath("/dashboard/exams");
  revalidatePath("/dashboard/rankings");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard");
  redirect("/dashboard/groups");
}
export async function createStudent(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const input = studentSchema.parse(Object.fromEntries(formData));
    const { supabase, workspaceId } = await context();
    const { data: student, error } = await supabase
      .from("students")
      .insert({
        workspace_id: workspaceId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone || null,
        preparation_level: input.preparationLevel || null,
        private_notes: input.privateNotes || null,
      })
      .select("id")
      .single();
    if (error || !student)
      throw new Error(
        error?.code === "23505"
          ? "Bu e-poçtla şagird artıq mövcuddur."
          : "Şagird yaradıla bilmədi.",
      );
    const { error: memberError } = await supabase
      .from("group_memberships")
      .insert({ student_id: student.id, group_id: input.groupId });
    if (memberError)
      throw new Error("Şagird yaradıldı, lakin qrupa qoşulmadı.");
    const warnings: string[] = [];
    const contacts = parentContacts(student.id, input).filter(
      (contact) => contact.full_name || contact.phone,
    );
    if (contacts.length) {
      const { error: contactError } = await supabase
        .from("parent_contacts")
        .insert(contacts);
      if (contactError) warnings.push("Valideyn əlaqələri saxlanılmadı.");
    }
    const { data: fnData, error: inviteError } =
      await supabase.functions.invoke("invite-student", {
        body: { studentId: student.id, password: input.password },
      });
    if (inviteError || (fnData && !fnData.ok))
      warnings.push(
        (fnData as any)?.error || "Giriş hesabı aktivləşdirilə bilmədi.",
      );
    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${student.id}`);
    if (warnings.length)
      return {
        ok: true,
        warning: `Şagird əlavə edildi, lakin ${warnings.join(" ")}`,
      };
    return {
      ok: true,
      message: "Şagird, valideyn əlaqələri və giriş hesabı uğurla yaradıldı.",
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function updateStudent(
  studentId: string,
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const id = studentIdSchema.parse(studentId);
    const input = studentUpdateSchema.parse(Object.fromEntries(formData));
    const { supabase, workspaceId } = await context();
    const [{ data: student }, { data: group }] = await Promise.all([
      supabase
        .from("students")
        .select("id")
        .eq("id", id)
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
      supabase
        .from("groups")
        .select("id")
        .eq("id", input.groupId)
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .maybeSingle(),
    ]);
    if (!student) throw new Error("Şagird tapılmadı.");
    if (!group) throw new Error("Seçilmiş qrup tapılmadı və ya aktiv deyil.");
    const { data: updated, error } = await supabase
      .from("students")
      .update({
        full_name: input.fullName,
        phone: input.phone || null,
        preparation_level: input.preparationLevel || null,
        private_notes: input.privateNotes || null,
      })
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select("id")
      .single();
    if (error || !updated)
      throw new Error("Şagird məlumatları yenilənə bilmədi.");
    const { data: membership } = await supabase
      .from("group_memberships")
      .select("id,group_id")
      .eq("student_id", id)
      .eq("active", true)
      .maybeSingle();
    if (membership?.group_id !== input.groupId) {
      const today = new Date().toISOString().slice(0, 10);
      if (membership) {
        const { error: leaveError } = await supabase
          .from("group_memberships")
          .update({ active: false, left_at: today })
          .eq("id", membership.id);
        if (leaveError)
          throw new Error("Şagirdin əvvəlki qrup məlumatı yenilənə bilmədi.");
      }
      const { error: joinError } = await supabase
        .from("group_memberships")
        .insert({ student_id: id, group_id: input.groupId, joined_at: today });
      if (joinError)
        throw new Error(
          "Şagird məlumatları yeniləndi, lakin yeni qrupa keçirilmədi.",
        );
    }
    for (const contact of parentContacts(id, input)) {
      const { error: contactError } =
        contact.full_name || contact.phone
          ? await supabase
              .from("parent_contacts")
              .upsert(contact, { onConflict: "student_id,contact_type" })
          : await supabase
              .from("parent_contacts")
              .delete()
              .eq("student_id", id)
              .eq("contact_type", contact.contact_type);
      if (contactError)
        throw new Error(
          "Şagird məlumatları yeniləndi, lakin valideyn əlaqələri saxlanılmadı.",
        );
    }
    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${id}`);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/rankings");
    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard");
    revalidatePath("/student/profile");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: "Şagird və valideyn məlumatları uğurla yeniləndi.",
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function deleteStudent(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const studentId = studentIdSchema.parse(
      String(formData.get("studentId") || ""),
    );
    const { supabase } = await context();
    const { data, error } = await supabase.functions.invoke("delete-student", {
      body: { studentId },
    });
    if (error) throw new Error("Şagird və giriş hesabı silinə bilmədi.");
    if (!data?.ok)
      throw new Error(
        typeof data?.error === "string"
          ? data.error
          : "Şagird və giriş hesabı silinə bilmədi.",
      );
  } catch (e) {
    return { error: friendly(e) };
  }
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/rankings");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard");
  redirect("/dashboard/students");
}
export async function transferStudent(
  studentId: string,
  newGroupId: string,
): Promise<Result> {
  try {
    const { supabase } = await context();
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("group_memberships")
      .update({ active: false, left_at: today })
      .eq("student_id", studentId)
      .eq("active", true);
    if (error) throw error;
    const { error: addError } = await supabase
      .from("group_memberships")
      .insert({
        student_id: studentId,
        group_id: newGroupId,
        joined_at: today,
      });
    if (addError) throw addError;
    revalidatePath(`/dashboard/students/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function createSchedule(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const weekdays = formData.getAll("weekdays").map(Number);
    const sessions = weekdays.map((weekday) => ({
      weekday,
      startTime: `${formData.get(`day-${weekday}-startHour`) || ""}:${formData.get(`day-${weekday}-startMinute`) || ""}`,
      endTime: `${formData.get(`day-${weekday}-endHour`) || ""}:${formData.get(`day-${weekday}-endMinute`) || ""}`,
    }));
    const input = scheduleSchema.parse({
      ...Object.fromEntries(formData),
      sessions,
      startTime: `${formData.get("day-0-startHour") || ""}:${formData.get("day-0-startMinute") || ""}`,
      endTime: `${formData.get("day-0-endHour") || ""}:${formData.get("day-0-endMinute") || ""}`,
    });
    const { supabase, workspaceId } = await context();
    const { data: group } = await supabase
      .from("groups")
      .select("name,workspace_id")
      .eq("id", input.groupId)
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .single();
    if (!group) throw new Error("Qrup tapılmadı və ya aktiv deyil.");
    const extra = input.scheduleType === "extra";
    const targetSessions = extra
      ? [
          {
            weekday: weekdayFromDate(input.sessionDate),
            startTime: input.startTime,
            endTime: input.endTime,
          },
        ]
      : input.sessions;
    if (extra) {
      const now = bakuDateTime();
      if (
        input.sessionDate < now.date ||
        (input.sessionDate === now.date &&
          input.endTime <= now.time.slice(0, 5))
      )
        throw new Error("Bitmiş tarix və saat üçün əlavə dərs yaratmaq olmaz.");
    }
    const targetWeekdays = [
      ...new Set(targetSessions.map((session) => session.weekday)),
    ];
    const { data: slots } = await supabase
      .from("group_schedules")
      .select(
        "id,group_id,weekday,start_time,end_time,is_extra,session_date,groups!inner(name,workspace_id)",
      )
      .in("weekday", targetWeekdays)
      .eq("groups.workspace_id", group.workspace_id);
    const conflicts = (slots || []).filter((slot: any) =>
      targetSessions.some((session) => {
        const sameOccurrence = extra
          ? slot.is_extra
            ? slot.session_date === input.sessionDate
            : slot.weekday === session.weekday
          : !slot.is_extra && slot.weekday === session.weekday;
        return (
          sameOccurrence &&
          slot.start_time < session.endTime &&
          session.startTime < slot.end_time
        );
      }),
    );
    if (conflicts.length && !input.allowConflict) {
      const where = extra
        ? `${input.sessionDate} tarixində`
        : [
            ...new Set(conflicts.map((slot: any) => weekDays[slot.weekday])),
          ].join(", ") + " günlərində";
      throw new Error(`${where} seçilən saat başqa qrupun dərsi ilə toqquşur.`);
    }
    const rows = targetSessions.map((session) => ({
      group_id: input.groupId,
      weekday: session.weekday,
      start_time: session.startTime,
      end_time: session.endTime,
      location: input.location || null,
      is_extra: extra,
      session_date: extra ? input.sessionDate : null,
    }));
    const { data: created, error } = await supabase
      .from("group_schedules")
      .insert(rows)
      .select("id");
    if (error || !created?.length)
      throw new Error(
        error?.code === "23505"
          ? "Bu dərs vaxtı artıq mövcuddur."
          : "Dərs vaxtları əlavə edilə bilmədi.",
      );
    const details = extra
      ? `${input.sessionDate} · ${input.startTime}–${input.endTime}`
      : targetSessions
          .map(
            (session) =>
              `${weekDays[session.weekday]} ${session.startTime}–${session.endTime}`,
          )
          .join(" · ");
    await notifyGroup(supabase, {
      workspaceId,
      groupId: input.groupId,
      type: extra ? "extra_lesson" : "schedule_created",
      title: extra ? "Əlavə dərs yaradıldı" : "Yeni dərs saatı əlavə edildi",
      body: `${group.name}: ${details}`,
      link: "/student/schedule",
      eventKey: `schedule-create:${created
        .map((row) => row.id)
        .sort()
        .join(":")}`,
    });
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/groups/${input.groupId}`);
    revalidatePath("/student/schedule");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: extra
        ? "Əlavə dərs yaradıldı və şagirdlərə bildiriş göndərildi."
        : `${input.sessions.length} gün üçün dərs vaxtları əlavə edildi və şagirdlər məlumatlandırıldı.`,
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function deleteSchedule(id: string): Promise<Result> {
  try {
    const { supabase, workspaceId } = await context();
    const { data: schedule } = await supabase
      .from("group_schedules")
      .select("id,group_id,weekday,start_time,end_time,is_extra,session_date,groups!inner(name,workspace_id)")
      .eq("id", id)
      .eq("groups.workspace_id", workspaceId)
      .maybeSingle();
    if (!schedule) throw new Error("Dərs tapılmadı.");

    const { error } = await supabase.from("group_schedules").delete().eq("id", id);
    if (error) throw new Error("Dərs ləğv edilə bilmədi.");

    const group = Array.isArray(schedule.groups) ? schedule.groups[0] : schedule.groups;
    const details = schedule.is_extra
      ? `${schedule.session_date} · ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}`
      : `${weekDays[schedule.weekday]} · ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}`;
    const notification = await notifyGroup(supabase, {
      workspaceId,
      groupId: schedule.group_id,
      type: "schedule_cancelled",
      title: "Dərs ləğv edildi",
      body: `${group?.name || "Qrup"}: ${details}`,
      link: "/student/schedule",
      eventKey: `schedule-cancel:${schedule.id}`,
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/groups/${schedule.group_id}`);
    revalidatePath("/student/schedule");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: "Dərs ləğv edildi və şagirdlərə bildiriş göndərildi.",
      warning: notification.error
        ? "Dərs ləğv edildi, amma bildiriş göndərilə bilmədi."
        : undefined,
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function cancelNextScheduleOccurrence(id: string): Promise<Result> {
  try {
    const { supabase, workspaceId } = await context();
    const { data: schedule } = await supabase
      .from("group_schedules")
      .select("id,group_id,weekday,start_time,end_time,is_extra,groups!inner(name,workspace_id)")
      .eq("id", id)
      .eq("groups.workspace_id", workspaceId)
      .maybeSingle();
    if (!schedule) throw new Error("Dərs tapılmadı.");
    if (schedule.is_extra)
      throw new Error("Birdəfəlik ləğv yalnız həftəlik dərslər üçün mümkündür.");

    const occurrenceDate = nextScheduleOccurrenceDate(
      schedule.weekday,
      schedule.end_time,
    );
    const { error } = await supabase
      .from("group_schedule_cancellations")
      .insert({ schedule_id: schedule.id, occurrence_date: occurrenceDate });
    if (error?.code === "23505")
      throw new Error("Növbəti dərs artıq birdəfəlik ləğv edilib.");
    if (error) throw new Error("Növbəti dərs ləğv edilə bilmədi.");

    const group = Array.isArray(schedule.groups) ? schedule.groups[0] : schedule.groups;
    const notification = await notifyGroup(supabase, {
      workspaceId,
      groupId: schedule.group_id,
      type: "schedule_occurrence_cancelled",
      title: "Növbəti dərs ləğv edildi",
      body: `${group?.name || "Qrup"}: ${formatAzDate(occurrenceDate)} · ${weekDays[schedule.weekday]} · ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}. Dərs gələn həftə cədvəl üzrə davam edəcək.`,
      link: "/student/schedule",
      eventKey: `schedule-occurrence-cancel:${schedule.id}:${occurrenceDate}`,
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/groups/${schedule.group_id}`);
    revalidatePath("/student/schedule");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: `${formatAzDate(occurrenceDate)} tarixli dərs ləğv edildi. Həftəlik cədvəl saxlanıldı.`,
      warning: notification.error
        ? "Dərs birdəfəlik ləğv edildi, amma bildiriş göndərilə bilmədi."
        : undefined,
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function updateSchedule(
  scheduleId: string,
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const startTime = `${formData.get("startHour") || ""}:${formData.get("startMinute") || ""}`;
    const endTime = `${formData.get("endHour") || ""}:${formData.get("endMinute") || ""}`;
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
      endTime <= startTime
    )
      throw new Error("Başlama və bitmə saatlarını düzgün seçin.");
    const { supabase, workspaceId } = await context();
    const { data: schedule } = await supabase
      .from("group_schedules")
      .select(
        "id,group_id,weekday,start_time,end_time,is_extra,session_date,groups!inner(name,workspace_id)",
      )
      .eq("id", scheduleId)
      .eq("groups.workspace_id", workspaceId)
      .maybeSingle();
    if (!schedule) throw new Error("Dərs vaxtı tapılmadı.");
    const group = Array.isArray(schedule.groups)
      ? schedule.groups[0]
      : schedule.groups;
    const sessionDate = String(
      formData.get("sessionDate") || schedule.session_date || "",
    );
    if (schedule.is_extra) {
      const now = bakuDateTime();
      if (
        sessionDate < now.date ||
        (sessionDate === now.date && endTime <= now.time.slice(0, 5))
      )
        throw new Error("Əlavə dərsin yeni vaxtı gələcəkdə olmalıdır.");
    }
    const weekday = schedule.is_extra
      ? weekdayFromDate(sessionDate)
      : schedule.weekday;
    const { error } = await supabase
      .from("group_schedules")
      .update({
        weekday,
        start_time: startTime,
        end_time: endTime,
        session_date: schedule.is_extra ? sessionDate : null,
        location: String(formData.get("location") || "") || null,
      })
      .eq("id", scheduleId);
    if (error) throw new Error("Dərs vaxtı yenilənə bilmədi.");
    const oldValue = schedule.is_extra
      ? `${schedule.session_date} ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}`
      : `${weekDays[schedule.weekday]} ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}`;
    const newValue = schedule.is_extra
      ? `${sessionDate} ${startTime}–${endTime}`
      : `${weekDays[weekday]} ${startTime}–${endTime}`;
    await notifyGroup(supabase, {
      workspaceId,
      groupId: schedule.group_id,
      type: "schedule_updated",
      title: "Dərs saatı dəyişdirildi",
      body: `${group?.name || "Qrup"}: ${oldValue} → ${newValue}`,
      link: "/student/schedule",
      eventKey: `schedule-update:${scheduleId}:${Date.now()}`,
    });
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/groups/${schedule.group_id}`);
    revalidatePath("/student/schedule");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: "Dərs vaxtı yeniləndi və şagirdlərə bildiriş göndərildi.",
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function createExam(
  _: unknown,
  formData: FormData,
): Promise<Result> {
  try {
    const input = examSchema.parse({
      ...Object.fromEntries(formData),
      groupIds: formData.getAll("groupIds"),
    });
    const { supabase, workspaceId } = await context();
    const { data: groups, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .in("id", input.groupIds)
      .eq("workspace_id", workspaceId)
      .eq("status", "active");
    if (groupError || !groups || groups.length !== input.groupIds.length)
      throw new Error("Seçilən qruplardan biri tapılmadı və ya aktiv deyil.");
    const rows = input.groupIds.map((groupId) => ({
      title: input.title,
      group_id: groupId,
      exam_date: input.examDate,
      total_questions: input.totalQuestions,
      description: input.description || null,
    }));
    const { data: createdExams, error } = await supabase
      .from("examinations")
      .insert(rows)
      .select("id,group_id");
    if (error || !createdExams || createdExams.length !== rows.length)
      throw new Error("Sınaqlar yaradıla bilmədi.");
    const notificationResults = await Promise.all(
      createdExams.map((exam) =>
        notifyGroup(supabase, {
          workspaceId,
          groupId: exam.group_id,
          type: "exam_created",
          title: input.title,
          body: buildExamNotificationBody(input.examDate, input.description),
          link: "/student/dashboard",
          eventKey: `exam-create:${exam.id}`,
        }),
      ),
    );
    const notificationFailed = notificationResults.some(
      (result) => result.error,
    );
    revalidatePath("/dashboard/exams");
    revalidatePath("/dashboard");
    input.groupIds.forEach((groupId) =>
      revalidatePath(`/dashboard/groups/${groupId}`),
    );
    return {
      ok: true,
      message: `Sınaq ${input.groupIds.length} qrup üçün yaradıldı və şagirdlərə bildiriş göndərildi.`,
      warning: notificationFailed
        ? "Sınaq yaradıldı, amma bəzi bildirişlər göndərilmədi."
        : undefined,
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
export async function saveResults(
  examinationId: string,
  entries: { studentId: string; correctAnswers: number | null }[],
): Promise<Result> {
  try {
    const { supabase, workspaceId } = await context();
    const { data: exam } = await supabase
      .from("examinations")
      .select("title,total_questions,group_id,groups!inner(name,workspace_id)")
      .eq("id", examinationId)
      .eq("groups.workspace_id", workspaceId)
      .single();
    if (!exam) throw new Error("Sınaq tapılmadı.");
    const rows = entries
      .filter((e) => e.correctAnswers !== null)
      .map((e) => {
        const parsed = resultSchema.parse({
          examinationId,
          studentId: e.studentId,
          correctAnswers: e.correctAnswers,
        });
        if (parsed.correctAnswers > exam.total_questions)
          throw new Error(
            `Düzgün cavab sayı ${exam.total_questions}-dan çox ola bilməz.`,
          );
        return {
          examination_id: examinationId,
          student_id: parsed.studentId,
          correct_answers: parsed.correctAnswers,
        };
      });
    if (rows.length) {
      const { data: existingResults, error: existingResultsError } = await supabase
        .from("exam_results")
        .select("student_id,correct_answers")
        .eq("examination_id", examinationId);
      if (existingResultsError)
        throw new Error("Mövcud nəticələr yoxlanıla bilmədi.");

      const {
        changedRows,
        newlyPublishedStudentIds,
        updatedStudentIds,
      } = classifyResultChanges(rows, existingResults || []);
      if (!changedRows.length) {
        return { ok: true, message: "Dəyişiklik yoxdur." };
      }

      const { error } = await supabase
        .from("exam_results")
        .upsert(changedRows, { onConflict: "examination_id,student_id" });
      if (error) throw new Error("Nəticələr saxlanıla bilmədi.");
      const group = Array.isArray(exam.groups) ? exam.groups[0] : exam.groups;
      const notificationVersion = Date.now();

      if (!existingResults?.length) {
        await notifyGroup(supabase, {
          workspaceId,
          groupId: exam.group_id,
          type: "exam_result",
          title: "Sınaq nəticəsi açıqlandı",
          body: `${exam.title} · ${group?.name || "Qrup"}. Nəticənə indi bax.`,
          link: "/student/results",
          eventKey: `exam-result:${examinationId}`,
        });
      } else if (newlyPublishedStudentIds.length) {
        await notifyStudents(supabase, {
          workspaceId,
          studentIds: newlyPublishedStudentIds,
          type: "exam_result",
          title: "Sınaq nəticəsi açıqlandı",
          body: `${exam.title} · Nəticənə indi bax.`,
          link: "/student/results",
          eventKey: `exam-result-published:${examinationId}:${notificationVersion}`,
        });
      }

      if (updatedStudentIds.length) {
        await notifyStudents(supabase, {
          workspaceId,
          studentIds: updatedStudentIds,
          type: "exam_result_updated",
          title: "Sınaq nəticəsi yeniləndi",
          body: `${exam.title} · Yenilənmiş nəticənə indi bax.`,
          link: "/student/results",
          eventKey: `exam-result-update:${examinationId}:${notificationVersion}`,
        });
      }
    }
    revalidatePath(`/dashboard/exams/${examinationId}`);
    revalidatePath("/student/results");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: rows.length
        ? "Nəticələr saxlanıldı və şagirdlərə bildiriş göndərildi."
        : "Dəyişiklik yoxdur.",
    };
  } catch (e) {
    return { error: friendly(e) };
  }
}
