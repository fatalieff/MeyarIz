import { Sidebar } from "@/components/layout/sidebar"; import { requireRole } from "@/lib/auth/session";
export const instant=false;
export default async function TeacherLayout({children}:{children:React.ReactNode}){if(process.env.NEXT_PUBLIC_SUPABASE_URL)await requireRole("teacher");return <div className="min-h-screen lg:flex"><Sidebar/><div className="min-w-0 flex-1">{children}</div></div>}
