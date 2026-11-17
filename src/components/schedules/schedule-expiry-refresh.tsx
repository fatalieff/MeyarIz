"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ScheduleExpiryRefresh({ endTimes }: { endTimes: string[] }) {
  const router = useRouter();
  const key = endTimes.join("|");

  useEffect(() => {
    const nextExpiry = endTimes.map((value) => new Date(value).getTime()).filter((value) => value > Date.now()).sort((a, b) => a - b)[0];
    if (!nextExpiry) return;
    const timer = window.setTimeout(() => router.refresh(), Math.min(nextExpiry - Date.now() + 500, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [endTimes, key, router]);

  return null;
}
