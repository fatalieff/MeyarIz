"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWebPush } from "@/lib/notifications/server";

type TestNotificationResult = {
  ok?: true;
  error?: string;
  message?: string;
};

export async function sendTestNotification(): Promise<TestNotificationResult> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase bağlantısı qurulmayıb." };

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return { error: "Sessiya bitib. Yenidən daxil olun." };

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id,workspace_id")
    .eq("auth_user_id", userId)
    .eq("status", "active")
    .single();
  if (studentError || !student) return { error: "Aktiv şagird profili tapılmadı." };

  const { data: notification, error: insertError } = await supabase
    .from("notifications")
    .insert({
      workspace_id: student.workspace_id,
      student_id: student.id,
      type: "test",
      title: "Test bildirişi uğurludur",
      body: "MeyarİZ cihaz bildirişlərini düzgün qəbul edir.",
      link: "/student/dashboard",
      event_key: `push-test:${crypto.randomUUID()}`,
    })
    .select("id")
    .single();
  if (insertError || !notification) {
    console.error("[notifications] Test notification could not be created:", insertError);
    return { error: "Test bildirişi yaradıla bilmədi." };
  }

  const delivery = await sendWebPush(supabase, [notification.id]);
  if (delivery.error) return { error: delivery.error };
  if (delivery.targets === 0) return { error: "Bu cihaz serverdə qeydiyyatda deyil. Bildiriş icazəsini yenidən aktiv edin." };
  if (delivery.sent === 0) return { error: "Cihaz bildirişi göndərilə bilmədi. Abunəliyi yenidən aktiv edin." };

  return { ok: true, message: "Test bildirişi cihazınıza göndərildi." };
}
