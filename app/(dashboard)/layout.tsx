import { redirect } from "next/navigation";

import { Nav } from "@/components/dashboard/nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authEnabled = isSupabaseConfigured();
  if (authEnabled) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login");
  }
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_minmax(0,1fr)] md:grid-rows-[72px_minmax(0,1fr)]">
      <Nav authEnabled={authEnabled} />
      <main className="min-w-0 p-4 pb-24 md:col-start-2 md:row-span-2 md:row-start-1 md:p-8">{!authEnabled && <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">Supabase bağlantısı eklenene kadar geliştirme modu açık.</div>}{children}</main>
    </div>
  );
}
