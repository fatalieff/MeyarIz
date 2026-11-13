import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function getSessionProfile(){ const supabase=await createClient(); if(!supabase) return null; const {data:{user}}=await supabase.auth.getUser(); if(!user)return null; const {data:profile}=await supabase.from("profiles").select("id,role,full_name").eq("id",user.id).single(); return profile; }
export async function requireRole(role:"teacher"|"student"){ const profile=await getSessionProfile(); if(!profile) redirect("/login"); if(profile.role!==role) redirect(profile.role==="student"?"/student/dashboard":"/dashboard"); return profile; }
