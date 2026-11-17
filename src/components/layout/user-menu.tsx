"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, LoaderCircle, LogOut, Settings, UserRound } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  userName: string;
  role: "teacher" | "student";
};

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="size-[18px] animate-spin" /> : <LogOut className="size-[18px]" />}
      {pending ? "Çıxış edilir..." : "Hesabdan çıx"}
    </button>
  );
}

export function UserMenu({ userName, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = userName.trim().slice(0, 1).toUpperCase() || "M";
  const profileHref = role === "teacher" ? "/dashboard/settings" : "/student/profile";
  const profileLabel = role === "teacher" ? "Tənzimləmələr" : "Profilim";
  const ProfileIcon = role === "teacher" ? Settings : UserRound;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Hesab menyusunu aç"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "group flex items-center gap-2 rounded-xl border bg-white p-1.5 shadow-xs transition-colors hover:border-slate-300 sm:gap-3 sm:pr-3",
          isOpen ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200",
        )}
      >
        <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 font-bold text-white shadow-xs">
          {initial}
        </span>
        <span className="hidden min-w-0 text-left text-sm sm:block">
          <strong className="block max-w-40 truncate text-slate-800">{userName}</strong>
          <span className="text-[11px] text-slate-500">{role === "teacher" ? "Müəllim hesabı" : "Şagird hesabı"}</span>
        </span>
        <ChevronDown className={cn("hidden size-4 text-slate-400 transition-transform sm:block", isOpen && "rotate-180 text-indigo-600")} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          <div className="mb-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 sm:hidden">
            <strong className="block truncate text-sm text-slate-900">{userName}</strong>
            <span className="text-xs text-slate-500">{role === "teacher" ? "Müəllim hesabı" : "Şagird hesabı"}</span>
          </div>
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <ProfileIcon className="size-[18px] text-indigo-500" />
            {profileLabel}
          </Link>
          <div className="my-1 h-px bg-slate-100" />
          <form action={logout}>
            <LogoutButton />
          </form>
        </div>
      )}
    </div>
  );
}
