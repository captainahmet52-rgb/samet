import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { isSupabaseConfigured } from "./config";

export async function createClient() {
  if (!isSupabaseConfigured()) throw new Error("Supabase ortam değişkenleri tanımlı değil.");
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component içinde cookie yenilemeyi middleware üstlenir.
          }
        },
      },
    },
  );
}
