"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { urunEkle, urunGuncelle } from "@/lib/actions/urun";

type Product = { id: string; ad: string; birim: string; kritikStok: number };

export function UrunForm({ urun, trigger }: { urun?: Product; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = new FormData(event.currentTarget);
    const input = { ad: form.get("ad"), birim: form.get("birim"), kritikStok: form.get("kritikStok") };
    const result = urun ? await urunGuncelle(urun.id, input) : await urunEkle(input);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Yeni Ürün Ekle</Button>}</DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>{urun ? "Ürünü düzenle" : "Yeni ürün ekle"}</DialogTitle><DialogDescription>Ürün adı, stok birimi ve kritik stok eşiğini girin.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5"><Label htmlFor={`ad-${urun?.id ?? "new"}`}>Ürün adı</Label><Input id={`ad-${urun?.id ?? "new"}`} name="ad" defaultValue={urun?.ad} required /></div>
          <div className="space-y-1.5"><Label htmlFor={`birim-${urun?.id ?? "new"}`}>Birim</Label><Input id={`birim-${urun?.id ?? "new"}`} name="birim" defaultValue={urun?.birim} placeholder="adet, litre, koli…" required /></div>
          <div className="space-y-1.5"><Label htmlFor={`kritik-${urun?.id ?? "new"}`}>Kritik stok</Label><Input id={`kritik-${urun?.id ?? "new"}`} name="kritikStok" type="number" min="0" defaultValue={urun?.kritikStok ?? 0} required /></div>
          <Button className="w-full" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
