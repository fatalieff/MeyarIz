"use client";

import Link from "next/link";
import { Bell, BellRing, CheckCheck, LoaderCircle, Send, Smartphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { sendTestNotification } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/browser";

type NotificationItem = {
  id: string;
  type: "schedule_created" | "schedule_updated" | "extra_lesson" | "exam_result" | "test";
  title: string;
  body: string;
  link: string;
  read_at: string | null;
  created_at: string;
};

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function subscriptionUsesKey(subscription: PushSubscription, publicKey: string) {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const expected = urlBase64ToUint8Array(publicKey);
  const actual = new Uint8Array(current);
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

const timeFormatter = new Intl.DateTimeFormat("az-AZ", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [studentId, setStudentId] = useState<string>();
  const [open, setOpen] = useState(false);
  const [pushState, setPushState] = useState<"unknown" | "enabled" | "disabled" | "unsupported">("unknown");
  const [enabling, setEnabling] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pushMessage, setPushMessage] = useState<string>();
  const [needsIosInstall, setNeedsIosInstall] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const unread = useMemo(() => items.filter((item) => !item.read_at).length, [items]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: student } = await supabase.from("students").select("id").eq("auth_user_id", user.id).maybeSingle();
      if (!student) return;
      setStudentId(student.id);

      const { data } = await supabase.from("notifications").select("id,type,title,body,link,read_at,created_at").order("created_at", { ascending: false }).limit(30);
      setItems((data || []) as NotificationItem[]);

      channel = supabase.channel(`student-notifications-${student.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `student_id=eq.${student.id}` }, (payload) => {
          setItems((current) => [payload.new as NotificationItem, ...current.filter((item) => item.id !== payload.new.id)].slice(0, 30));
        })
        .subscribe();

      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setPushState("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      let subscription = await registration.pushManager.getSubscription();
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
        || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
      setNeedsIosInstall(isIos && !isStandalone);

      if (subscription && publicKey && !subscriptionUsesKey(subscription, publicKey)) {
        await subscription.unsubscribe();
        subscription = null;
      }
      if (subscription && Notification.permission === "granted") {
        const serialized = subscription.toJSON();
        if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) throw new Error("Push abunəliyi natamamdır.");
        const { error: syncError } = await supabase.from("push_subscriptions").upsert({
          student_id: student.id,
          endpoint: serialized.endpoint,
          p256dh: serialized.keys.p256dh,
          auth: serialized.keys.auth,
          user_agent: navigator.userAgent,
        }, { onConflict: "endpoint" });
        if (syncError) throw syncError;
        setPushState("enabled");
        setPushMessage("Cihaz serverlə sinxronlaşdırıldı.");
      } else {
        setPushState("disabled");
      }
    };

    void setup().catch((error: unknown) => {
      console.error("Notification setup failed:", error);
      setPushState("disabled");
      setPushMessage("Cihaz qeydiyyatı tamamlanmadı. Yenidən aktiv edin.");
    });
    return () => { if (channel) void supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const enablePush = async () => {
    const supabase = createClient();
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!supabase || !studentId || !publicKey || pushState === "unsupported") return;
    setEnabling(true);
    setPushMessage(undefined);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState("disabled");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      let existing = await registration.pushManager.getSubscription();
      if (existing && !subscriptionUsesKey(existing, publicKey)) {
        await existing.unsubscribe();
        existing = null;
      }
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const serialized = subscription.toJSON();
      if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) throw new Error("Push abunəliyi natamamdır.");
      const { error } = await supabase.from("push_subscriptions").upsert({
        student_id: studentId,
        endpoint: serialized.endpoint,
        p256dh: serialized.keys.p256dh,
        auth: serialized.keys.auth,
        user_agent: navigator.userAgent,
      }, { onConflict: "endpoint" });
      if (error) throw error;
      setPushState("enabled");
      setPushMessage("Cihaz bildirişləri aktivdir.");
    } catch (error) {
      console.error("Push activation failed:", error);
      setPushState("disabled");
      setPushMessage("Aktivləşdirmə alınmadı. Brauzer icazəsini yoxlayıb yenidən cəhd edin.");
    } finally {
      setEnabling(false);
    }
  };

  const testPush = async () => {
    setTesting(true);
    setPushMessage(undefined);
    try {
      const result = await sendTestNotification();
      setPushMessage(result.message || result.error || "Test tamamlanmadı.");
    } catch (error) {
      console.error("Push test failed:", error);
      setPushMessage("Test zamanı bağlantı xətası yarandı.");
    } finally {
      setTesting(false);
    }
  };

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    const supabase = createClient();
    if (!supabase) return;
    const readAt = new Date().toISOString();
    const { error } = await supabase.from("notifications").update({ read_at: readAt }).in("id", ids);
    if (!error) setItems((current) => current.map((item) => ids.includes(item.id) ? { ...item, read_at: readAt } : item));
  };

  return <div ref={container} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={unread ? `${unread} oxunmamış bildiriş` : "Bildirişlər"} aria-expanded={open} className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
      {unread ? <BellRing className="size-4.5"/> : <Bell className="size-4.5"/>}
      {unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-5 text-white">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <div className="absolute right-0 top-12 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div><strong className="text-sm text-slate-900">Bildirişlər</strong><p className="text-xs text-slate-500">{unread ? `${unread} yeni bildiriş` : "Hamısı oxunub"}</p></div>
        {unread > 0 && <button type="button" onClick={() => void markRead(items.filter((item) => !item.read_at).map((item) => item.id))} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"><CheckCheck className="size-3.5"/>Hamısını oxu</button>}
      </div>
      {pushState !== "enabled" && pushState !== "unsupported" && <div className="border-b bg-indigo-50/70 p-3">
        <button type="button" disabled={enabling || !studentId} onClick={() => void enablePush()} className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-indigo-100 disabled:opacity-60">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-700"><Smartphone className="size-4"/></span>
          <span><strong className="block text-xs text-slate-900">Cihaz bildirişlərini aktiv et</strong><span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Sayt bağlı olanda da dərs və nəticə yeniliklərini al.</span></span>
        </button>
        {needsIosInstall && <p className="mt-2 text-[11px] leading-4 text-amber-700">iPhone-da push üçün saytı Safari paylaş menyusundan “Ana ekrana əlavə et”, sonra həmin ikonla aç.</p>}
      </div>}
      {pushState === "enabled" && <div className="flex items-center justify-between gap-3 border-b bg-emerald-50/60 px-4 py-3">
        <div><strong className="block text-xs text-emerald-900">Cihaz bildirişləri aktivdir</strong><span className="text-[11px] text-emerald-700">İndi real göndərişi yoxlaya bilərsiniz.</span></div>
        <button type="button" disabled={testing} onClick={() => void testPush()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">
          {testing ? <LoaderCircle className="size-3.5 animate-spin"/> : <Send className="size-3.5"/>}Test et
        </button>
      </div>}
      {pushMessage && <p className="border-b bg-slate-50 px-4 py-2 text-[11px] leading-4 text-slate-600">{pushMessage}</p>}
      <div className="max-h-[25rem] overflow-y-auto">
        {items.length ? items.map((item) => <Link key={item.id} href={item.link} onClick={() => { setOpen(false); void markRead([item.id]); }} className={`block border-b px-4 py-3 transition last:border-0 hover:bg-slate-50 ${item.read_at ? "bg-white" : "bg-indigo-50/40"}`}>
          <div className="flex gap-3"><span className={`mt-1 size-2 shrink-0 rounded-full ${item.read_at ? "bg-slate-200" : "bg-indigo-500"}`}/><span className="min-w-0"><strong className="block text-sm text-slate-900">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{item.body}</span><time className="mt-1.5 block text-[10px] font-medium text-slate-400">{timeFormatter.format(new Date(item.created_at))}</time></span></div>
        </Link>) : <div className="px-5 py-10 text-center"><Bell className="mx-auto size-7 text-slate-300"/><p className="mt-2 text-sm font-semibold text-slate-600">Hələ bildiriş yoxdur</p><p className="mt-1 text-xs text-slate-400">Yeni dərs və nəticələr burada görünəcək.</p></div>}
      </div>
    </div>}
  </div>;
}
