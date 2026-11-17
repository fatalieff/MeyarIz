import { describe, expect, it } from "vitest";
import { roleHomePath, type AppUserRole } from "@/lib/auth/session";

describe("role redirection and home path rules", () => {
  it("routes admin to /admin", () => {
    expect(roleHomePath("admin")).toBe("/admin");
  });

  it("routes teacher to /dashboard", () => {
    expect(roleHomePath("teacher")).toBe("/dashboard");
  });

  it("routes student to /student/dashboard", () => {
    expect(roleHomePath("student")).toBe("/student/dashboard");
  });
});

describe("route guard authorization logic", () => {
  function evaluateAccess(
    targetRouteRole: AppUserRole,
    userProfile: { role: AppUserRole; status: "active" | "suspended" } | null
  ) {
    if (!userProfile) return { allowed: false, redirect: "/login" };
    if (userProfile.status === "suspended") {
      return { allowed: false, redirect: "/login?suspended=1" };
    }
    if (userProfile.role !== targetRouteRole) {
      return { allowed: false, redirect: roleHomePath(userProfile.role) };
    }
    return { allowed: true, redirect: null };
  }

  it("allows active admin into admin routes", () => {
    const res = evaluateAccess("admin", { role: "admin", status: "active" });
    expect(res.allowed).toBe(true);
  });

  it("redirects teacher attempting to access /admin to /dashboard", () => {
    const res = evaluateAccess("admin", { role: "teacher", status: "active" });
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/dashboard");
  });

  it("redirects student attempting to access /admin to /student/dashboard", () => {
    const res = evaluateAccess("admin", { role: "student", status: "active" });
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/student/dashboard");
  });

  it("redirects admin attempting to access teacher /dashboard to /admin", () => {
    const res = evaluateAccess("teacher", { role: "admin", status: "active" });
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/admin");
  });

  it("redirects admin attempting to access student /student/dashboard to /admin", () => {
    const res = evaluateAccess("student", { role: "admin", status: "active" });
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/admin");
  });

  it("blocks suspended teacher from accessing dashboard", () => {
    const res = evaluateAccess("teacher", { role: "teacher", status: "suspended" });
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/login?suspended=1");
  });

  it("blocks suspended admin from accessing admin panel", () => {
    const res = evaluateAccess("admin", { role: "admin", status: "suspended" });
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/login?suspended=1");
  });

  it("redirects unauthenticated visitor to /login", () => {
    const res = evaluateAccess("admin", null);
    expect(res.allowed).toBe(false);
    expect(res.redirect).toBe("/login");
  });
});
