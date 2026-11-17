import { describe, expect, it } from "vitest";
import {
  createTeacherSchema,
  updateTeacherSchema,
  resetTeacherPasswordSchema,
  toggleTeacherStatusSchema,
  deleteTeacherSchema,
} from "@/lib/validations/schemas";

describe("createTeacherSchema validation", () => {
  const validData = {
    fullName: "Aysel Məmmədova",
    email: "aysel@example.com",
    workspaceName: "Zəfər Tədris",
    password: "Password123!",
    confirmPassword: "Password123!",
    status: "active",
  };

  it("accepts valid teacher registration payload", () => {
    const res = createTeacherSchema.safeParse(validData);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.fullName).toBe("Aysel Məmmədova");
      expect(res.data.email).toBe("aysel@example.com");
      expect(res.data.workspaceName).toBe("Zəfər Tədris");
    }
  });

  it("normalizes and lowercases email", () => {
    const res = createTeacherSchema.safeParse({
      ...validData,
      email: "  AYSEL@Example.COM  ",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.email).toBe("aysel@example.com");
    }
  });

  it("rejects mismatched password and confirmPassword", () => {
    const res = createTeacherSchema.safeParse({
      ...validData,
      confirmPassword: "DifferentPassword123!",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const issues = res.error.issues;
      expect(issues.some((i) => i.message.includes("eyn"))).toBe(true);
    }
  });

  it("rejects temporary passwords shorter than 8 characters", () => {
    const res = createTeacherSchema.safeParse({
      ...validData,
      password: "short",
      confirmPassword: "short",
    });
    expect(res.success).toBe(false);
  });

  it("rejects invalid email formats", () => {
    const res = createTeacherSchema.safeParse({
      ...validData,
      email: "invalid-email-string",
    });
    expect(res.success).toBe(false);
  });

  it("rejects empty workspace name", () => {
    const res = createTeacherSchema.safeParse({
      ...validData,
      workspaceName: "   ",
    });
    expect(res.success).toBe(false);
  });

  it("rejects empty or short fullName", () => {
    const res = createTeacherSchema.safeParse({
      ...validData,
      fullName: "A",
    });
    expect(res.success).toBe(false);
  });
});

describe("updateTeacherSchema validation", () => {
  it("accepts valid teacher update payload", () => {
    expect(
      updateTeacherSchema.safeParse({
        teacherId: "11111111-1111-4111-8111-111111111111",
        fullName: "Elvin Babayev",
        workspaceName: "Elvin Math Lab",
      }).success
    ).toBe(true);
  });

  it("rejects invalid teacher uuid or short names", () => {
    expect(
      updateTeacherSchema.safeParse({
        teacherId: "not-a-uuid",
        fullName: "E",
        workspaceName: "",
      }).success
    ).toBe(false);
  });
});

describe("resetTeacherPasswordSchema validation", () => {
  const validReset = {
    teacherId: "11111111-1111-4111-8111-111111111111",
    password: "NewSecretPassword123",
    confirmPassword: "NewSecretPassword123",
  };

  it("accepts valid reset payload", () => {
    expect(resetTeacherPasswordSchema.safeParse(validReset).success).toBe(true);
  });

  it("rejects mismatched confirm password", () => {
    expect(
      resetTeacherPasswordSchema.safeParse({
        ...validReset,
        confirmPassword: "MismatchPassword123",
      }).success
    ).toBe(false);
  });

  it("rejects short password (< 8 chars)", () => {
    expect(
      resetTeacherPasswordSchema.safeParse({
        ...validReset,
        password: "short",
        confirmPassword: "short",
      }).success
    ).toBe(false);
  });
});

describe("toggleTeacherStatusSchema and deleteTeacherSchema", () => {
  it("validates teacher status transition", () => {
    expect(
      toggleTeacherStatusSchema.safeParse({
        teacherId: "11111111-1111-4111-8111-111111111111",
        status: "suspended",
      }).success
    ).toBe(true);

    expect(
      toggleTeacherStatusSchema.safeParse({
        teacherId: "11111111-1111-4111-8111-111111111111",
        status: "invalid-status",
      }).success
    ).toBe(false);
  });

  it("requires non-empty confirmation string for deletion", () => {
    expect(
      deleteTeacherSchema.safeParse({
        teacherId: "11111111-1111-4111-8111-111111111111",
        confirmation: "SİL",
      }).success
    ).toBe(true);

    expect(
      deleteTeacherSchema.safeParse({
        teacherId: "11111111-1111-4111-8111-111111111111",
        confirmation: "   ",
      }).success
    ).toBe(false);
  });
});
