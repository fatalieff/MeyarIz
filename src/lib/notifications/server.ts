import "server-only";

import * as webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType = "schedule_created" | "schedule_updated" | "schedule_cancelled" | "schedule_occurrence_cancelled" | "schedule_occurrence_reactivated" | "extra_lesson" | "exam_created" | "exam_result" | "exam_result_updated";

type NotificationInput = {
  workspaceId: string;
  groupId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  eventKey: string;
};

type StudentNotificationInput = Omit<NotificationInput, "groupId"> & {
  studentIds: string[];
};

type PushTarget = {
  notification_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  link: string;
};

export type PushDeliveryResult = {
  targets: number;
  sent: number;
  failed: number;
  error?: string;
};

export async function sendWebPush(
  supabase: SupabaseClient,
  notificationIds: string[],
): Promise<PushDeliveryResult> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (notificationIds.length === 0) return { targets: 0, sent: 0, failed: 0 };
  if (!publicKey || !privateKey || !subject) {
    console.error("[notifications] VAPID environment variables are missing.");
    return { targets: 0, sent: 0, failed: 0, error: "VAPID konfiqurasiyası natamamdır." };
  }

  const { data, error } = await supabase.rpc("notification_push_targets", {
    p_notification_ids: notificationIds,
  });
  if (error) {
    console.error("[notifications] Push targets could not be loaded:", error);
    return { targets: 0, sent: 0, failed: 0, error: "Push cihazları yüklənmədi." };
  }
  if (!data?.length) return { targets: 0, sent: 0, failed: 0 };

  webpush.setVapidDetails(subject, publicKey, privateKey);
  const deliveries = await Promise.allSettled((data as PushTarget[]).map((target) =>
    webpush.sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify({
        title: target.title,
        body: target.body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        data: { url: target.link, notificationId: target.notification_id },
      }),
      { TTL: 60 * 60 * 24, urgency: "high" },
    )
  ));
  const failed = deliveries.filter((delivery) => delivery.status === "rejected");
  if (failed.length) {
    console.error("[notifications] Some push deliveries failed:", failed.map((delivery) =>
      delivery.status === "rejected" && delivery.reason instanceof Error
        ? delivery.reason.message
        : "Unknown push error",
    ));
  }
  return {
    targets: deliveries.length,
    sent: deliveries.length - failed.length,
    failed: failed.length,
  };
}

export async function notifyGroup(supabase: SupabaseClient, input: NotificationInput) {
  const { data: memberships, error: membershipError } = await supabase
    .from("group_memberships")
    .select("student_id,students!inner(workspace_id,status)")
    .eq("group_id", input.groupId)
    .eq("active", true)
    .eq("students.workspace_id", input.workspaceId)
    .eq("students.status", "active");

  if (membershipError) {
    console.error("[notifications] Group members could not be loaded:", membershipError);
    return { recipients: 0, ...await sendWebPush(supabase, []), error: "Qrup üzvləri yüklənmədi." };
  }
  if (!memberships?.length) return { recipients: 0, targets: 0, sent: 0, failed: 0 };

  return insertNotifications(
    supabase,
    input,
    memberships.map((membership) => membership.student_id),
  );
}

export async function notifyStudents(
  supabase: SupabaseClient,
  input: StudentNotificationInput,
) {
  const studentIds = [...new Set(input.studentIds)];
  if (!studentIds.length) return { recipients: 0, targets: 0, sent: 0, failed: 0 };

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id")
    .in("id", studentIds)
    .eq("workspace_id", input.workspaceId)
    .eq("status", "active");
  if (studentError) {
    console.error("[notifications] Students could not be loaded:", studentError);
    return { recipients: 0, ...await sendWebPush(supabase, []), error: "Şagirdlər yüklənmədi." };
  }

  return insertNotifications(
    supabase,
    input,
    (students || []).map((student) => student.id),
  );
}

async function insertNotifications(
  supabase: SupabaseClient,
  input: Omit<NotificationInput, "groupId">,
  studentIds: string[],
) {
  if (!studentIds.length) return { recipients: 0, targets: 0, sent: 0, failed: 0 };

  const notificationIds = studentIds.map(() => crypto.randomUUID());
  const rows = studentIds.map((studentId, index) => ({
    id: notificationIds[index],
    workspace_id: input.workspaceId,
    student_id: studentId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
    event_key: input.eventKey,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error?.code === "23505") {
    return { recipients: 0, targets: 0, sent: 0, failed: 0 };
  }
  if (error) {
    console.error("[notifications] Notification rows could not be created:", error);
    return { recipients: 0, targets: 0, sent: 0, failed: 0, error: "Bildirişlər yaradıla bilmədi." };
  }

  const delivery = await sendWebPush(supabase, notificationIds);
  return { recipients: rows.length, ...delivery };
}
