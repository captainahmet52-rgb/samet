"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) return toast.error("E-posta veya şifre hatalı.");
    router.replace("/");
    router.refresh();
  }

  if (!configured) {
    return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Geliştirme modu: Supabase anahtarları henüz tanımlanmadı.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-1.5"><Label htmlFor="email">E-posta</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="space-y-1.5"><Label htmlFor="password">Şifre</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      <Button className="w-full" disabled={pending}>{pending ? "Giriş yapılıyor…" : "Giriş yap"}</Button>
    </form>
  );
}
