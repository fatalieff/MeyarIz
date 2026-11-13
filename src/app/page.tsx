import { redirect } from "next/navigation"; import { getSessionProfile } from "@/lib/auth/session";
export const instant=false;
export default async function Home(){const profile=await getSessionProfile();redirect(profile?.role==="student"?"/student/dashboard":profile?.role==="teacher"?"/dashboard":"/login");}
