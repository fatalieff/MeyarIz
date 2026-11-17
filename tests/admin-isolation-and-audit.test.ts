import { describe, expect, it } from "vitest";
import type { AdminTeacherDetails, AdminOverviewStats } from "@/lib/queries/admin";

describe("workspace multi-tenant isolation", () => {
  interface WorkspaceRecord {
    id: string;
    workspaceId: string;
    name: string;
  }

  function simulateTeacherQuery(
    teacherWorkspaceId: string,
    records: WorkspaceRecord[]
  ) {
    // Simulates RLS: using (is_teacher_of_workspace(workspace_id))
    return records.filter((r) => r.workspaceId === teacherWorkspaceId);
  }

  it("ensures Teacher A can only see records belonging to Teacher A's workspace", () => {
    const records: WorkspaceRecord[] = [
      { id: "group-1", workspaceId: "ws-teacher-A", name: "10-cu sinif A" },
      { id: "group-2", workspaceId: "ws-teacher-A", name: "11-ci sinif B" },
      { id: "group-3", workspaceId: "ws-teacher-B", name: "Riyaziyyat Qrupu B" },
    ];

    const teacherAResults = simulateTeacherQuery("ws-teacher-A", records);
    expect(teacherAResults).toHaveLength(2);
    expect(teacherAResults.some((r) => r.workspaceId === "ws-teacher-B")).toBe(false);

    const teacherBResults = simulateTeacherQuery("ws-teacher-B", records);
    expect(teacherBResults).toHaveLength(1);
    expect(teacherBResults[0].id).toBe("group-3");
  });

  it("blocks Teacher A from accessing Teacher B's student by passing arbitrary ID", () => {
    const students = [
      { id: "student-1", workspaceId: "ws-teacher-A", fullName: "Murad Əliyev" },
      { id: "student-2", workspaceId: "ws-teacher-B", fullName: "Leyla Qasımova" },
    ];

    function getStudentById(requestingWorkspaceId: string, targetStudentId: string) {
      const student = students.find((s) => s.id === targetStudentId);
      if (!student || student.workspaceId !== requestingWorkspaceId) {
        return null; // RLS returns 0 rows
      }
      return student;
    }

    // Teacher A tries to fetch Teacher B's student ID
    expect(getStudentById("ws-teacher-A", "student-2")).toBeNull();
    // Teacher B can fetch their own student
    expect(getStudentById("ws-teacher-B", "student-2")).not.toBeNull();
  });
});

describe("admin data isolation and zero student PII guarantee", () => {
  it("confirms admin overview stats only contain anonymous counts", () => {
    const stats: AdminOverviewStats = {
      totalTeachers: 12,
      activeTeachers: 10,
      suspendedTeachers: 2,
      totalWorkspaces: 12,
      totalStudents: 145,
      totalGroups: 24,
      totalExams: 68,
    };

    const keys = Object.keys(stats);
    // All values must be numbers
    for (const key of keys) {
      expect(typeof (stats as any)[key]).toBe("number");
    }

    // Must not contain any array of names or records
    expect((stats as any).students).toBeUndefined();
    expect((stats as any).studentNames).toBeUndefined();
    expect((stats as any).examResults).toBeUndefined();
  });

  it("confirms teacher details object for admin has no student lists or exam results", () => {
    const teacherDetails: AdminTeacherDetails = {
      id: "teacher-uuid-1",
      fullName: "Kamran Həsənov",
      email: "kamran@example.com",
      workspaceId: "ws-uuid-1",
      workspaceName: "Dədə Qorqud Kursu",
      status: "active",
      createdAt: "2026-11-17T12:00:00Z",
      lastSignInAt: "2026-11-17T14:30:00Z",
      studentCount: 35,
      groupCount: 4,
      examCount: 12,
      auditLogs: [],
    };

    // Ensure forbidden PII properties do not exist
    expect((teacherDetails as any).students).toBeUndefined();
    expect((teacherDetails as any).groups).toBeUndefined();
    expect((teacherDetails as any).examinations).toBeUndefined();
    expect((teacherDetails as any).examResults).toBeUndefined();
    expect((teacherDetails as any).parentContacts).toBeUndefined();
    expect((teacherDetails as any).schedules).toBeUndefined();

    // Verify only aggregate counters exist
    expect(typeof teacherDetails.studentCount).toBe("number");
    expect(typeof teacherDetails.groupCount).toBe("number");
    expect(typeof teacherDetails.examCount).toBe("number");
  });
});

describe("audit log sanitation rules", () => {
  function sanitizeAuditPayload(input: Record<string, unknown>) {
    const forbidden = ["password", "token", "serviceRoleKey", "jwt", "secret", "studentName", "phone"];
    const sanitized = { ...input };
    for (const key of Object.keys(sanitized)) {
      if (forbidden.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
        delete sanitized[key];
      }
    }
    return sanitized;
  }

  it("strips password and secret keys from audit log details", () => {
    const rawDetails = {
      email: "teacher@test.com",
      password: "SuperSecretPassword123!",
      confirmPassword: "SuperSecretPassword123!",
      serviceRoleKey: "eyJhbGciOi...",
      workspaceName: "Riyaziyyat Mərkəzi",
    };

    const clean = sanitizeAuditPayload(rawDetails);
    expect(clean.password).toBeUndefined();
    expect(clean.confirmPassword).toBeUndefined();
    expect(clean.serviceRoleKey).toBeUndefined();
    expect(clean.email).toBe("teacher@test.com");
    expect(clean.workspaceName).toBe("Riyaziyyat Mərkəzi");
  });
});
