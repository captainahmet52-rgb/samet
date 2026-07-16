import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Bu işlem için oturum açmalısınız.");
}
