import Link from "next/link";

import { UrunForm } from "@/components/urunler/urun-form";
import { UrunTable } from "@/components/urunler/urun-table";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UrunlerPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const params = await searchParams;
  const sadeceKritik = params.durum === "kritik";
  const configured = isDatabaseConfigured();
  const urunler = configured ? await prisma.urun.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true, birim: true, mevcutStok: true, kritikStok: true, fiyat: true } }) : [];
  const rows = urunler
    .filter(u => !sadeceKritik || u.mevcutStok <= u.kritikStok)
    .map(u => ({ ...u, fiyat: u.fiyat.toNumber() }));
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-500">Stok Yönetimi</p><h1 className="text-2xl font-bold">{sadeceKritik ? "Kritik Stoktaki Ürünler" : "Ürünler"}</h1></div><UrunForm/></div>{!configured && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Ürün işlemleri için DATABASE_URL ve DIRECT_URL değerlerini .env dosyasına ekleyin.</p>}{sadeceKritik && <p className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Sadece stoku kritik seviyede olan ürünler gösteriliyor.<Link className="font-semibold underline" href="/urunler">Tüm ürünleri göster</Link></p>}<UrunTable data={rows} emptyText={sadeceKritik ? "Kritik stokta ürün yok." : undefined}/></div>;
}
