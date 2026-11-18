import { z } from "zod";
const optionalText = z.string().trim().optional().or(z.literal(""));
const parentContactFields = {
  motherName: optionalText,
  motherPhone: optionalText,
  fatherName: optionalText,
  fatherPhone: optionalText,
};
export const groupSchema = z.object({
  name: z.string().trim().min(2, "Qrup adı ən azı 2 simvol olmalıdır."),
  description: optionalText,
  preparationLevel: optionalText,
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .default("#4f5fe7"),
});
export const groupIdSchema = z
  .string()
  .uuid("Qrup identifikatoru düzgün deyil.");
export const studentSchema = z.object({
  fullName: z.string().trim().min(3, "Ad və soyadı daxil edin."),
  groupId: z.string().uuid("Qrup seçin."),
  email: z.string().trim().email("Düzgün e-poçt daxil edin."),
  password: z.string().min(6, "Şifrə ən azı 6 simvol olmalıdır."),
  phone: optionalText,
  preparationLevel: optionalText,
  privateNotes: optionalText,
  ...parentContactFields,
});
export const studentIdSchema = z
  .string()
  .uuid("Şagird identifikatoru düzgün deyil.");
export const studentUpdateSchema = z.object({
  fullName: z.string().trim().min(3, "Ad və soyadı daxil edin."),
  groupId: z.string().uuid("Qrup seçin."),
  phone: optionalText,
  preparationLevel: optionalText,
  privateNotes: optionalText,
  ...parentContactFields,
});
export const teacherProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Ad və soyad ən azı 3 simvol olmalıdır.")
    .max(100, "Ad və soyad 100 simvoldan çox ola bilməz."),
  workspaceName: z
    .string()
    .trim()
    .min(2, "İş sahəsinin adı ən azı 2 simvol olmalıdır.")
    .max(100, "İş sahəsinin adı 100 simvoldan çox ola bilməz."),
});
export const rankingSettingsSchema = z.object({
  defaultRankingPeriod: z.enum(["last_3", "month", "all"]),
  globalRankingVisible: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
});
export const examSchema = z.object({
  title: z.string().trim().min(3, "Sınağın adını daxil edin."),
  groupIds: z
    .array(z.string().uuid("Düzgün qrup seçin."))
    .min(1, "Ən azı bir qrup seçin.")
    .transform((ids) => [...new Set(ids)]),
  examDate: z.string().date("Tarix seçin."),
  totalQuestions: z.coerce.number().int().min(1).max(500),
  description: optionalText,
});
export const resultSchema = z.object({
  examinationId: z.string().uuid(),
  studentId: z.string().uuid(),
  correctAnswers: z.coerce.number().int().min(0),
});
const scheduleSessionSchema = z
  .object({
    weekday: z.coerce.number().int().min(1).max(7),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Başlama saatını tam seçin."),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Bitmə saatını tam seçin."),
  })
  .refine((session) => session.endTime > session.startTime, {
    message: "Bitmə vaxtı başlama vaxtından sonra olmalıdır.",
    path: ["endTime"],
  });
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saatı tam seçin.");
export const scheduleSchema = z
  .object({
    groupId: z.string().uuid("Əvvəlcə qrup seçin."),
    scheduleType: z.enum(["weekly", "extra"]).default("weekly"),
    sessions: z.array(scheduleSessionSchema).default([]),
    sessionDate: z.string().optional().default(""),
    startTime: z.string().optional().default(""),
    endTime: z.string().optional().default(""),
    location: optionalText,
    allowConflict: z.coerce.boolean().default(false),
  })
  .superRefine((input, ctx) => {
    if (input.scheduleType === "weekly") {
      if (!input.sessions.length)
        ctx.addIssue({
          code: "custom",
          message: "Ən azı bir gün və saat seçin.",
          path: ["sessions"],
        });
      const days = new Set<number>();
      input.sessions.forEach((session, index) => {
        if (days.has(session.weekday))
          ctx.addIssue({
            code: "custom",
            message: "Eyni gün yalnız bir dəfə əlavə edilə bilər.",
            path: ["sessions", index, "weekday"],
          });
        days.add(session.weekday);
      });
      return;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(input.sessionDate) ||
      Number.isNaN(Date.parse(`${input.sessionDate}T00:00:00Z`))
    )
      ctx.addIssue({
        code: "custom",
        message: "Əlavə dərsin tarixini seçin.",
        path: ["sessionDate"],
      });
    if (!timeSchema.safeParse(input.startTime).success)
      ctx.addIssue({
        code: "custom",
        message: "Başlama saatını tam seçin.",
        path: ["startTime"],
      });
    if (!timeSchema.safeParse(input.endTime).success)
      ctx.addIssue({
        code: "custom",
        message: "Bitmə saatını tam seçin.",
        path: ["endTime"],
      });
    if (
      timeSchema.safeParse(input.startTime).success &&
      timeSchema.safeParse(input.endTime).success &&
      input.endTime <= input.startTime
    )
      ctx.addIssue({
        code: "custom",
        message: "Bitmə vaxtı başlama vaxtından sonra olmalıdır.",
        path: ["endTime"],
      });
  });

export const createTeacherSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Ad və soyad ən azı 3 simvol olmalıdır.")
      .max(100, "Ad və soyad 100 simvoldan çox ola bilməz."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Düzgün e-poçt ünvanı daxil edin."),
    workspaceName: z
      .string()
      .trim()
      .min(2, "İş sahəsi / kurs adı ən azı 2 simvol olmalıdır.")
      .max(100, "İş sahəsi adı 100 simvoldan çox ola bilməz."),
    password: z
      .string()
      .min(8, "Müvəqqəti şifrə ən azı 8 simvol olmalıdır.")
      .max(72, "Şifrə 72 simvoldan çox ola bilməz."),
    confirmPassword: z.string().min(1, "Şifrə təkrarını daxil edin."),
    status: z.enum(["active", "suspended"]).default("active"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifrə və şifrə təkrarı eyni olmalıdır.",
    path: ["confirmPassword"],
  });

export const updateTeacherSchema = z.object({
  teacherId: z.string().uuid("Müəllim identifikatoru düzgün deyil."),
  fullName: z
    .string()
    .trim()
    .min(3, "Ad və soyad ən azı 3 simvol olmalıdır.")
    .max(100, "Ad və soyad 100 simvoldan çox ola bilməz."),
  workspaceName: z
    .string()
    .trim()
    .min(2, "İş sahəsi adı ən azı 2 simvol olmalıdır.")
    .max(100, "İş sahəsi adı 100 simvoldan çox ola bilməz."),
});

export const resetTeacherPasswordSchema = z
  .object({
    teacherId: z.string().uuid("Müəllim identifikatoru düzgün deyil."),
    password: z
      .string()
      .min(8, "Müvəqqəti şifrə ən azı 8 simvol olmalıdır.")
      .max(72, "Şifrə 72 simvoldan çox ola bilməz."),
    confirmPassword: z.string().min(1, "Şifrə təkrarını daxil edin."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifrə və şifrə təkrarı eyni olmalıdır.",
    path: ["confirmPassword"],
  });

export const toggleTeacherStatusSchema = z.object({
  teacherId: z.string().uuid("Müəllim identifikatoru düzgün deyil."),
  status: z.enum(["active", "suspended"]),
});

export const deleteTeacherSchema = z.object({
  teacherId: z.string().uuid("Müəllim identifikatoru düzgün deyil."),
  confirmation: z.string().trim().min(1, "Təsdiq mətnini daxil edin."),
});
