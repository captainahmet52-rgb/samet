import type { Prisma } from "@prisma/client";
import { CsvButton } from "@/components/hareketler/csv-button";
import { HareketFilters } from "@/components/hareketler/filters";
import { HareketForm } from "@/components/hareketler/hareket-form";
import { HareketTable } from "@/components/hareketler/hareket-table";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Params = { baslangic?: string; bitis?: string; urunId?: string; tip?: string };

export default async function HareketlerPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams; const configured = isDatabaseConfigured();
  const tarih: Prisma.DateTimeFilter = {};
  if (params.baslangic) tarih.gte = new Date(`${params.baslangic}T00:00:00`);
  if (params.bitis) tarih.lte = new Date(`${params.bitis}T23:59:59.999`);
  const where: Prisma.StokHareketWhereInput = {
    ...(Object.keys(tarih).length ? { tarih } : {}),
    ...(params.urunId ? { urunId: params.urunId } : {}),
    ...(params.tip === "GIRIS" || params.tip === "CIKIS" ? { tip: params.tip } : {}),
  };
  const [urunler, hareketler] = configured ? await Promise.all([
    prisma.urun.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true, birim: true, mevcutStok: true } }),
    prisma.stokHareket.findMany({ where, orderBy: { tarih: "desc" }, include: { urun: { select: { ad: true, birim: true } } } }),
  ]) : [[], []];
  const rows = hareketler.map(h => ({ id: h.id, tarih: h.tarih.toISOString(), urun: h.urun.ad, birim: h.urun.birim, tip: h.tip, miktar: h.miktar, birimFiyat: h.birimFiyat.toNumber(), toplam: h.toplam.toNumber(), aciklama: h.aciklama }));
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-500">Depo İşlemleri</p><h1 className="text-2xl font-bold">Stok Hareketleri</h1></div><div className="flex gap-2"><CsvButton rows={rows}/><HareketForm urunler={urunler}/></div></div>{!configured && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Hareket işlemleri için veritabanı bağlantısını yapılandırın.</p>}<HareketFilters urunler={urunler} values={params}/><HareketTable data={rows}/></div>;
}
