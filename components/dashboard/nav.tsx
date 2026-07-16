"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, LayoutDashboard, LogOut, PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/urunler", label: "Ürünler", icon: Boxes },
  { href: "/hareketler", label: "Stok Hareketleri", icon: PackagePlus },
  { href: "/rapor", label: "Raporlar", icon: BarChart3 },
];

export function Nav({ authEnabled }: { authEnabled: boolean }) {
  const pathname = usePathname();
  async function logout() {
    if (authEnabled) await createClient().auth.signOut();
    location.href = "/login";
  }
  return (
    <>
      <div className="border-b bg-emerald-950 px-4 py-4 text-white md:col-start-1 md:row-start-1 md:border-b-0 md:border-r">
        <div className="mx-auto flex max-w-7xl items-center justify-between md:block">
          <div><p className="font-bold">Temizlik Deposu</p><p className="text-xs text-emerald-300">Stok Yönetimi</p></div>
          <Button aria-label="Çıkış yap" className="md:hidden" size="icon" variant="ghost" onClick={logout}><LogOut className="size-4" /></Button>
        </div>
      </div>
      <aside className="hidden border-r bg-white p-3 md:col-start-1 md:row-start-2 md:flex md:flex-col">
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium", pathname === href ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <Button className="mt-auto justify-start" variant="ghost" onClick={logout}><LogOut className="size-4" />Çıkış yap</Button>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-white p-1 md:hidden">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 rounded-md py-2 text-[10px]", pathname === href && "bg-emerald-50 text-emerald-800")}><Icon className="size-5" />{label}</Link>)}
      </nav>
    </>
  );
}
