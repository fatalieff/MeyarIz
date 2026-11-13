export type WeeklySession={ id?:string; groupId:string; groupName?:string; weekday:number; startTime:string; endTime:string };
const minutes=(time:string)=>{ const [h,m]=time.split(":").map(Number); return h*60+m; };
export function validateSession(session:WeeklySession){ if(session.weekday<1||session.weekday>7) return "Həftənin günü düzgün deyil."; if(minutes(session.endTime)<=minutes(session.startTime)) return "Bitmə vaxtı başlama vaxtından sonra olmalıdır."; return null; }
export function sessionsOverlap(a:WeeklySession,b:WeeklySession){ return a.weekday===b.weekday && minutes(a.startTime)<minutes(b.endTime) && minutes(b.startTime)<minutes(a.endTime); }
export function findConflicts(target:WeeklySession, all:WeeklySession[]){ return all.filter(s=>s.id!==target.id && sessionsOverlap(target,s)); }
export const weekDays=["", "Bazar ertəsi","Çərşənbə axşamı","Çərşənbə","Cümə axşamı","Cümə","Şənbə","Bazar"];
