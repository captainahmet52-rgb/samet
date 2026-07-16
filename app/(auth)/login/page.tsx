import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-emerald-950 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-800 bg-white p-7 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-emerald-700">Temizlik Deposu</p>
          <h1 className="mt-1 text-2xl font-bold">Yönetici girişi</h1>
          <p className="mt-2 text-sm text-slate-500">Stok paneline erişmek için giriş yapın.</p>
        </div>
        <LoginForm configured={isSupabaseConfigured()} />
      </div>
    </main>
  );
}
