export type WeeklySession={ id?:string; groupId:string; groupName?:string; weekday:number; startTime:string; endTime:string };
export type ScheduleLike={ is_extra?:boolean|null; session_date?:string|null; end_time:string };
export type OccurrenceSchedule={
  id?:string;
  weekday:number;
  start_time:string;
  end_time:string;
  is_extra?:boolean|null;
  session_date?:string|null;
  group_schedule_cancellations?:{ occurrence_date:string }[]|null;
};
const minutes=(time:string)=>{ const [h,m]=time.split(":").map(Number); return h*60+m; };
export function validateSession(session:WeeklySession){ if(session.weekday<1||session.weekday>7) return "Həftənin günü düzgün deyil."; if(minutes(session.endTime)<=minutes(session.startTime)) return "Bitmə vaxtı başlama vaxtından sonra olmalıdır."; return null; }
export function sessionsOverlap(a:WeeklySession,b:WeeklySession){ return a.weekday===b.weekday && minutes(a.startTime)<minutes(b.endTime) && minutes(b.startTime)<minutes(a.endTime); }
export function findConflicts(target:WeeklySession, all:WeeklySession[]){ return all.filter(s=>s.id!==target.id && sessionsOverlap(target,s)); }
export const weekDays=["", "Bazar ertəsi","Çərşənbə axşamı","Çərşənbə","Cümə axşamı","Cümə","Şənbə","Bazar"];

export function bakuDateTime(now=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Baku",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).formatToParts(now);
  const part=(type:Intl.DateTimeFormatPartTypes)=>parts.find(item=>item.type===type)?.value||"";
  return{date:`${part("year")}-${part("month")}-${part("day")}`,time:`${part("hour")}:${part("minute")}:${part("second")}`};
}

export function isScheduleVisible(schedule:ScheduleLike,now=new Date()){
  if(!schedule.is_extra)return true;
  if(!schedule.session_date)return false;
  const current=bakuDateTime(now);
  return schedule.session_date>current.date||(schedule.session_date===current.date&&schedule.end_time.slice(0,8)>current.time);
}

export function weekdayFromDate(date:string){
  const day=new Date(`${date}T00:00:00Z`).getUTCDay();
  return day===0?7:day;
}

export function nextScheduleOccurrenceDate(
  weekday:number,
  endTime:string,
  now=new Date(),
){
  const current=bakuDateTime(now);
  const currentWeekday=weekdayFromDate(current.date);
  let daysAhead=(weekday-currentWeekday+7)%7;

  if(daysAhead===0&&endTime.slice(0,5)<=current.time.slice(0,5)) daysAhead=7;

  const occurrence=new Date(`${current.date}T00:00:00Z`);
  occurrence.setUTCDate(occurrence.getUTCDate()+daysAhead);
  return occurrence.toISOString().slice(0,10);
}

export function isScheduleOccurrencePast(
  occurrenceDate:string,
  endTime:string,
  now=new Date(),
){
  const current=bakuDateTime(now);
  return occurrenceDate<current.date||(
    occurrenceDate===current.date&&endTime.slice(0,5)<=current.time.slice(0,5)
  );
}

export function findOccurrenceConflicts(
  target:OccurrenceSchedule,
  schedules:OccurrenceSchedule[],
  occurrenceDate:string,
){
  const occurrenceWeekday=weekdayFromDate(occurrenceDate);
  return schedules.filter((schedule)=>{
    if(schedule.id===target.id)return false;
    const occursOnDate=schedule.is_extra
      ? schedule.session_date===occurrenceDate
      : schedule.weekday===occurrenceWeekday;
    const isCancelled=schedule.group_schedule_cancellations?.some(
      (cancellation)=>cancellation.occurrence_date===occurrenceDate,
    );
    return Boolean(
      occursOnDate&&
      !isCancelled&&
      schedule.start_time<target.end_time&&
      target.start_time<schedule.end_time,
    );
  });
}
