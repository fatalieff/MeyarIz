import { BarChart3, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard, Medal, Settings, Sigma, Users, WalletCards } from "lucide-react";

export const teacherNav = [
  ["/dashboard", "İdarəetmə paneli", LayoutDashboard],
  ["/dashboard/groups", "Qruplar", GraduationCap],
  ["/dashboard/students", "Şagirdlər", Users],
  ["/dashboard/payments", "Ödənişlər", WalletCards],
  ["/dashboard/schedule", "Dərs cədvəli", CalendarDays],
  ["/dashboard/exams", "Sınaqlar", ClipboardCheck],
  ["/dashboard/rankings", "Ümumi reytinq", Medal],
  ["/dashboard/analytics", "Analitika", BarChart3],
  ["/dashboard/settings", "Tənzimləmələr", Settings],
] as const;

export const studentNav = [
  ["/student/dashboard", "Ana səhifə", LayoutDashboard],
  ["/student/results", "Nəticələr", ClipboardCheck],
  ["/student/leaderboard", "Reytinq", Medal],
  ["/student/schedule", "Cədvəl", CalendarDays],
  ["/student/achievements", "Nailiyyətlər", Sigma],
  ["/student/profile", "Profil", Users],
] as const;

export type NavigationRole = "teacher" | "student";
export const navigationFor = (role: NavigationRole) => role === "teacher" ? teacherNav : studentNav;
export const navigationHome = (role: NavigationRole) => role === "teacher" ? "/dashboard" : "/student/dashboard";
export const isNavigationActive = (path: string, href: string) => href.endsWith("dashboard") ? path === href : path.startsWith(href);
