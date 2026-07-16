"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hareketEkle } from "@/lib/actions/hareket";

type UrunOption = { id: string; ad: string; birim: string; mevcutStok: number };

export function HareketForm({ urunler }: { urunler: UrunOption[] }) {
  const [open, setOpen] = useState(false); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = new FormData(event.currentTarget);
    const result = await hareketEkle({ urunId: form.get("urunId"), tip: form.get("tip"), miktar: form.get("miktar"), birimFiyat: form.get("birimFiyat"), tarih: form.get("tarih"), aciklama: form.get("aciklama") });
    setPending(false);
    if (result.ok) { toast.success(result.message); setOpen(false); }
    else toast.error(result.message);
  }
  const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button disabled={!urunler.length}>Yeni Hareket</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Yeni stok hareketi</DialogTitle><DialogDescription>Giriş depoyu artırır, çıkış depoyu azaltır.</DialogDescription></DialogHeader>
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="urunId">Ürün</Label><select id="urunId" name="urunId" className="h-10 w-full rounded-lg border bg-white px-3 text-sm" required defaultValue=""><option value="" disabled>Ürün seçin</option>{urunler.map(u => <option key={u.id} value={u.id}>{u.ad} — {u.mevcutStok} {u.birim}</option>)}</select></div>
      <div className="space-y-1.5"><Label htmlFor="tip">Hareket tipi</Label><select id="tip" name="tip" className="h-10 w-full rounded-lg border bg-white px-3 text-sm"><option value="GIRIS">Giriş (gider)</option><option value="CIKIS">Çıkış (gelir/kullanım)</option></select></div>
      <div className="space-y-1.5"><Label htmlFor="miktar">Miktar</Label><Input id="miktar" name="miktar" type="number" min="1" required /></div>
      <div className="space-y-1.5"><Label htmlFor="birimFiyat">Birim fiyat (₺)</Label><Input id="birimFiyat" name="birimFiyat" type="number" min="0" step="0.01" required /></div>
      <div className="space-y-1.5"><Label htmlFor="tarih">Tarih</Label><Input id="tarih" name="tarih" type="datetime-local" defaultValue={now.toISOString().slice(0, 16)} required /></div>
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="aciklama">Açıklama</Label><textarea id="aciklama" name="aciklama" rows={3} className="w-full rounded-lg border bg-white px-3 py-2 text-sm" placeholder="Nereden alındı / nereye gönderildi?" /></div>
      <Button className="sm:col-span-2" disabled={pending}>{pending ? "Kaydediliyor…" : "Hareketi kaydet"}</Button>
    </form>
  </DialogContent></Dialog>;
}
