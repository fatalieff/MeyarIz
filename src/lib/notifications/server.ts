import "server-only";

import * as webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType = "schedule_created" | "schedule_updated" | "extra_lesson" | "exam_result";

type NotificationInput = {
  workspaceId: string;
  groupId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  eventKey: string;
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

async function sendWebPush(supabase: SupabaseClient, notificationIds: string[]) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject || notificationIds.length === 0) return;

  const { data, error } = await supabase.rpc("notification_push_targets", {
    p_notification_ids: notificationIds,
  });
  if (error || !data?.length) return;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  await Promise.allSettled((data as PushTarget[]).map((target) =>
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
}

export async function notifyGroup(supabase: SupabaseClient, input: NotificationInput) {
  const { data: memberships, error: membershipError } = await supabase
    .from("group_memberships")
    .select("student_id,students!inner(workspace_id,status)")
    .eq("group_id", input.groupId)
    .eq("active", true)
    .eq("students.workspace_id", input.workspaceId)
    .eq("students.status", "active");

  if (membershipError || !memberships?.length) return;

  const notificationIds = memberships.map(() => crypto.randomUUID());
  const rows = memberships.map((membership, index) => ({
    id: notificationIds[index],
    workspace_id: input.workspaceId,
    student_id: membership.student_id,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
    event_key: input.eventKey,
  }));

  const { error } = await supabase.from("notifications").upsert(rows, {
    onConflict: "student_id,event_key",
    ignoreDuplicates: true,
  });
  if (error) return;

  await sendWebPush(supabase, notificationIds);
}
