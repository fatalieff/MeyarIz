import { z } from "zod";
const optionalText=z.string().trim().optional().or(z.literal(""));
export const groupSchema=z.object({ name:z.string().trim().min(2,"Qrup adı ən azı 2 simvol olmalıdır."), description:optionalText, preparationLevel:optionalText, color:z.string().regex(/^#[0-9a-f]{6}$/i).default("#4f5fe7") });
export const studentSchema=z.object({ fullName:z.string().trim().min(3,"Ad və soyadı daxil edin."), groupId:z.string().uuid("Qrup seçin."), email:z.string().trim().email("Dəvət göndərmək üçün düzgün e-poçt daxil edin."), phone:optionalText, preparationLevel:optionalText, privateNotes:optionalText });
export const studentIdSchema=z.string().uuid("Şagird identifikatoru düzgün deyil.");
export const examSchema=z.object({ title:z.string().trim().min(3,"Sınağın adını daxil edin."), groupId:z.string().uuid(), examDate:z.string().date(), totalQuestions:z.coerce.number().int().min(1).max(500), description:optionalText });
export const resultSchema=z.object({ examinationId:z.string().uuid(), studentId:z.string().uuid(), correctAnswers:z.coerce.number().int().min(0) });
export const scheduleSchema=z.object({ groupId:z.string().uuid(), weekday:z.coerce.number().int().min(1).max(7), startTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), endTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), location:optionalText, allowConflict:z.coerce.boolean().default(false) }).refine(x=>x.endTime>x.startTime,{message:"Bitmə vaxtı başlama vaxtından sonra olmalıdır.",path:["endTime"]});
