import Link from "next/link";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HareketFilters({ urunler, values }: { urunler: Array<{ id: string; ad: string }>; values: { baslangic?: string; bitis?: string; urunId?: string; tip?: string } }) {
  return <form className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
    <input aria-label="Başlangıç tarihi" className="h-10 rounded-lg border px-3 text-sm" name="baslangic" type="date" defaultValue={values.baslangic}/>
    <input aria-label="Bitiş tarihi" className="h-10 rounded-lg border px-3 text-sm" name="bitis" type="date" defaultValue={values.bitis}/>
    <select aria-label="Ürün filtresi" className="h-10 rounded-lg border bg-white px-3 text-sm" name="urunId" defaultValue={values.urunId ?? ""}><option value="">Tüm ürünler</option>{urunler.map(u => <option value={u.id} key={u.id}>{u.ad}</option>)}</select>
    <select aria-label="Hareket tipi filtresi" className="h-10 rounded-lg border bg-white px-3 text-sm" name="tip" defaultValue={values.tip ?? ""}><option value="">Tüm hareketler</option><option value="GIRIS">Giren ürün</option><option value="CIKIS">Çıkan ürün</option></select>
    <div className="flex gap-2"><Button className="flex-1" type="submit"><Filter className="size-4"/>Filtrele</Button><Link href="/hareketler" className="inline-flex size-10 items-center justify-center rounded-lg border bg-white" aria-label="Filtreleri temizle"><X className="size-4"/></Link></div>
  </form>;
}
