"use server";
import { redirect } from "next/navigation"; import { createClient } from "@/lib/supabase/server";
export async function login(_:unknown,formData:FormData){
  const supabase=await createClient();
  if(!supabase)return{error:"Supabase bağlantısı qurulmayıb."};
  const email=String(formData.get("email")||"");
  const password=String(formData.get("password")||"");
  const{error}=await supabase.auth.signInWithPassword({email,password});
  if(error)return{error:"E-poçt və ya şifrə yanlışdır."};
  const{data:{user}}=await supabase.auth.getUser();
  const{data:profile}=await supabase.from("profiles").select("role, status").eq("id",user!.id).single();

  if(profile?.status === "suspended"){
    await supabase.auth.signOut({scope:"local"});
    return{error:"Hesabınız inzibatçı tərəfindən dayandırılıb. Zəhmət olmasa admin ilə əlaqə saxlayın."};
  }

  if(profile?.role === "admin") {
    redirect("/admin");
  } else if(profile?.role === "student") {
    redirect("/student/dashboard");
  } else {
    redirect("/dashboard");
  }
}
export async function requestPasswordReset(_:unknown,formData:FormData){const supabase=await createClient();if(!supabase)return{error:"Supabase bağlantısı qurulmayıb."};const email=String(formData.get("email")||"").trim();if(!email)return{error:"E-poçt ünvanını daxil edin."};const appUrl=(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000").replace(/\/$/,"");const redirectTo=appUrl+"/auth/callback?next="+encodeURIComponent("/reset-password");const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});return error?{error:"Bərpa keçidi göndərilə bilmədi. Bir qədər sonra yenidən cəhd edin."}:{success:"Hesab mövcuddursa, şifrə bərpa keçidi e-poçtunuza göndərildi."};}
export async function updatePassword(_:unknown,formData:FormData){const supabase=await createClient();if(!supabase)return{error:"Supabase bağlantısı qurulmayıb."};const password=String(formData.get("password")||"");if(password.length<8)return{error:"Şifrə ən azı 8 simvol olmalıdır."};const{data:{user}}=await supabase.auth.getUser();if(!user)return{error:"Bərpa sessiyası tapılmadı. Yeni bərpa keçidi tələb edin."};const{error}=await supabase.auth.updateUser({password});if(error)return{error:"Şifrə yenilənə bilmədi. Bərpa keçidinin vaxtı bitmiş ola bilər."};await supabase.auth.signOut({scope:"local"});redirect("/login?reset=success");}
export async function logout(){const supabase=await createClient();await supabase?.auth.signOut({scope:"local"});redirect("/login");}
