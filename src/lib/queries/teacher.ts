import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { isScheduleVisible } from "@/lib/calculations/schedules";

async function workspace(){await connection();const supabase=await createClient();if(!supabase)return null;const{data:{user}}=await supabase.auth.getUser();if(!user)return null;const{data:ws}=await supabase.from("teacher_workspaces").select("id,name,birthday_welcome_completed").eq("owner_id",user.id).single();return ws?{supabase,ws}:null;}
export async function getTeacherProfileSettings(){await connection();const supabase=await createClient();if(!supabase)return null;const{data:{user}}=await supabase.auth.getUser();if(!user)return null;const[{data:profile,error:profileError},{data:workspace,error:workspaceError}]=await Promise.all([supabase.from("profiles").select("full_name").eq("id",user.id).single(),supabase.from("teacher_workspaces").select("name").eq("owner_id",user.id).single()]);if(profileError||workspaceError||!profile||!workspace)return null;return{fullName:profile.full_name,workspaceName:workspace.name};}
export async function getGroups(){const ctx=await workspace();if(!ctx)return[];const{data}=await ctx.supabase.from("groups").select("id,name,description,preparation_level,color,status,group_schedules(id,weekday,start_time,end_time,is_extra,session_date),group_memberships(count)").eq("workspace_id",ctx.ws.id).order("created_at",{ascending:false});return(data||[]).map((group:any)=>({...group,group_schedules:(group.group_schedules||[]).filter((schedule:any)=>isScheduleVisible(schedule))}));}
export async function getStudents(){
  const ctx=await workspace();
  if(!ctx)return[];
  const{data}=await ctx.supabase
    .from("students")
    .select("id,full_name,email,phone,status,auth_user_id,preparation_level,profiles:auth_user_id(role),group_memberships!inner(active,groups(id,name,color))")
    .eq("workspace_id",ctx.ws.id)
    .eq("group_memberships.active",true)
    .order("full_name");
  return (data||[]).filter((s:any)=>!s.profiles || s.profiles.role !== "admin");
}
export async function getExams(){const ctx=await workspace();if(!ctx)return[];const{data}=await ctx.supabase.from("examinations").select("id,title,exam_date,total_questions,status,groups!inner(id,name,workspace_id,color),exam_results(normalized_score)").eq("groups.workspace_id",ctx.ws.id).order("exam_date",{ascending:false});return data||[];}
export async function getSchedules(){const ctx=await workspace();if(!ctx)return[];const{data}=await ctx.supabase.from("group_schedules").select("id,weekday,start_time,end_time,location,is_extra,session_date,groups!inner(id,name,color,workspace_id,group_memberships(count))").eq("groups.workspace_id",ctx.ws.id).order("weekday").order("start_time");return(data||[]).filter((schedule:any)=>isScheduleVisible(schedule));}
export async function getDashboard(){const ctx=await workspace();if(!ctx)return{configured:false,workspace:null,students:0,groups:0,exams:0,average:null,results:[],recentExams:[],schedules:[],leaders:[]};const [groups,students,exams,results,schedules,leaders]=await Promise.all([
ctx.supabase.from("groups").select("id",{count:"exact",head:true}).eq("workspace_id",ctx.ws.id).eq("status","active"),
ctx.supabase.from("students").select("id",{count:"exact",head:true}).eq("workspace_id",ctx.ws.id).eq("status","active"),
ctx.supabase.from("examinations").select("id,groups!inner(workspace_id)",{count:"exact"}).eq("groups.workspace_id",ctx.ws.id).order("id").limit(1),
ctx.supabase.from("exam_results").select("normalized_score,examinations!inner(exam_date,groups!inner(workspace_id))").eq("examinations.groups.workspace_id",ctx.ws.id),
ctx.supabase.from("group_schedules").select("id,weekday,start_time,end_time,location,is_extra,session_date,groups!inner(id,name,color,workspace_id,group_memberships(count))").eq("groups.workspace_id",ctx.ws.id),
ctx.supabase.from("safe_leaderboard").select("student_id,full_name,group_name,examination_count,ranking_score").eq("workspace_id",ctx.ws.id).order("ranking_score",{ascending:false}).limit(5)
]);
const recent=await ctx.supabase.from("examinations").select("id,title,exam_date,total_questions,groups!inner(name,workspace_id),exam_results(normalized_score)").eq("groups.workspace_id",ctx.ws.id).order("exam_date",{ascending:false}).limit(5);
const scores=(results.data||[]).map((r:any)=>Number(r.normalized_score));
return{configured:true,workspace:ctx.ws,students:students.count||0,groups:groups.count||0,exams:exams.count||0,average:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null,results:results.data||[],recentExams:recent.data||[],schedules:(schedules.data||[]).filter((schedule:any)=>isScheduleVisible(schedule)),leaders:leaders.data||[]};}
export async function getExam(id:string){const ctx=await workspace();if(!ctx)return null;const{data:exam}=await ctx.supabase.from("examinations").select("id,title,exam_date,total_questions,description,groups!inner(id,name,workspace_id,color)").eq("id",id).eq("groups.workspace_id",ctx.ws.id).single();if(!exam)return null;const[{data:members},{data:results}]=await Promise.all([ctx.supabase.from("group_memberships").select("student_id,students(id,full_name,status)").eq("group_id",(exam.groups as any).id).eq("active",true),ctx.supabase.from("exam_results").select("id,student_id,correct_answers,normalized_score").eq("examination_id",id)]);return{exam,members:members||[],results:results||[]};}
export async function getStudent(id:string){const ctx=await workspace();if(!ctx)return null;const{data,error}=await ctx.supabase.from("students").select("*,parent_contacts(*),group_memberships(*,groups(id,name,color,group_schedules(*))),exam_results(correct_answers,normalized_score,examinations(id,title,exam_date,total_questions))").eq("id",id).eq("workspace_id",ctx.ws.id).maybeSingle();if(error)throw new Error("Şagird profili yüklənə bilmədi.",{cause:error});if(data)(data.group_memberships as any[]||[]).forEach((membership:any)=>{if(membership.groups)membership.groups.group_schedules=(membership.groups.group_schedules||[]).filter((schedule:any)=>isScheduleVisible(schedule));});return data;}
export async function getRankings(){const ctx=await workspace();if(!ctx)return[];const{data}=await ctx.supabase.from("safe_leaderboard").select("student_id,full_name,group_id,group_name,examination_count,ranking_score").eq("workspace_id",ctx.ws.id).order("ranking_score",{ascending:false});return data||[];}
export async function getGroup(id:string){const ctx=await workspace();if(!ctx)return null;const{data}=await ctx.supabase.from("groups").select("*,group_schedules(*),group_memberships(*,students(id,full_name,status,exam_results(normalized_score,examinations(exam_date,group_id))))").eq("id",id).eq("workspace_id",ctx.ws.id).single();return data?{...data,group_schedules:(data.group_schedules||[]).filter((schedule:any)=>isScheduleVisible(schedule))}:null;}
