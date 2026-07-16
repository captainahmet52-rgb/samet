import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import { paraFormat, tarihFormat } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SonHareket = Prisma.StokHareketGetPayload<{ include: { urun: { select: { ad: true; birim: true } } } }>;

const cardInfo = [
  { key: "urun", title: "Toplam ürün çeşidi", icon: Boxes, color: "text-blue-700", money: false },
  { key: "gider", title: "Bu ayki gider", icon: ArrowDownToLine, color: "text-red-700", money: true },
  { key: "gelir", title: "Bu ayki çıkış", icon: ArrowUpFromLine, color: "text-emerald-700", money: true },
  { key: "kritik", title: "Kritik stok", icon: AlertTriangle, color: "text-amber-700", money: false },
] as const;

export default async function DashboardPage() {
  const configured = isDatabaseConfigured();
  let values = { urun: 0, gider: 0, gelir: 0, kritik: 0 };
  let hareketler: SonHareket[] = [];
  if (configured) {
    const ayBasi = new Date(); ayBasi.setDate(1); ayBasi.setHours(0, 0, 0, 0);
    const [urunler, gider, gelir, sonHareketler] = await Promise.all([
      prisma.urun.findMany({ select: { mevcutStok: true, kritikStok: true } }),
      prisma.stokHareket.aggregate({ where: { tip: "GIRIS", tarih: { gte: ayBasi } }, _sum: { toplam: true } }),
      prisma.stokHareket.aggregate({ where: { tip: "CIKIS", tarih: { gte: ayBasi } }, _sum: { toplam: true } }),
      prisma.stokHareket.findMany({ take: 10, orderBy: { tarih: "desc" }, include: { urun: { select: { ad: true, birim: true } } } }),
    ]);
    values = { urun: urunler.length, gider: gider._sum.toplam?.toNumber() ?? 0, gelir: gelir._sum.toplam?.toNumber() ?? 0, kritik: urunler.filter(u => u.mevcutStok <= u.kritikStok).length };
    hareketler = sonHareketler;
  }
  return <div className="space-y-7"><div><p className="text-sm text-slate-500">Genel Bakış</p><h1 className="text-2xl font-bold">Depo özeti</h1></div>
    {!configured && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Canlı özet için veritabanı bağlantısını yapılandırın.</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cardInfo.map(({ key, title, icon: Icon, color, money }) => <Card key={key}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-slate-600">{title}</CardTitle><Icon className={`size-5 ${color}`}/></CardHeader><CardContent><p className="text-2xl font-bold">{money ? paraFormat.format(values[key]) : values[key]}</p></CardContent></Card>)}</section>
    <section><div className="mb-3"><h2 className="text-lg font-semibold">Son hareketler</h2><p className="text-sm text-slate-500">Depodaki son 10 giriş ve çıkış</p></div><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Ürün</th><th className="px-4 py-3">Tip</th><th className="px-4 py-3">Miktar</th><th className="px-4 py-3 text-right">Toplam</th></tr></thead><tbody>{hareketler.length ? hareketler.map(h => <tr className="border-t" key={h.id}><td className="whitespace-nowrap px-4 py-3">{tarihFormat.format(h.tarih)}</td><td className="px-4 py-3 font-medium">{h.urun.ad}</td><td className="px-4 py-3">{h.tip === "GIRIS" ? "Giriş" : "Çıkış"}</td><td className="px-4 py-3">{h.miktar} {h.urun.birim}</td><td className="px-4 py-3 text-right font-semibold">{paraFormat.format(h.toplam.toNumber())}</td></tr>) : <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Henüz hareket yok.</td></tr>}</tbody></table></div></section>
  </div>;
}
