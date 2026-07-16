import { ArrowDownToLine, ArrowUpFromLine, Scale } from "lucide-react";
import { AylikChart, type ChartRow } from "@/components/rapor/aylik-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import { paraFormat } from "@/lib/utils";

export const dynamic = "force-dynamic";

function inputDate(date: Date) { return date.toISOString().slice(0, 10); }

export default async function RaporPage({ searchParams }: { searchParams: Promise<{ baslangic?: string; bitis?: string }> }) {
  const params = await searchParams; const now = new Date(); const yearStart = new Date(now.getFullYear(), 0, 1);
  const baslangicText = params.baslangic ?? inputDate(yearStart); const bitisText = params.bitis ?? inputDate(now);
  const baslangic = new Date(`${baslangicText}T00:00:00`); const bitis = new Date(`${bitisText}T23:59:59.999`);
  const hareketler = isDatabaseConfigured() ? await prisma.stokHareket.findMany({ where: { tarih: { gte: baslangic, lte: bitis } }, orderBy: { tarih: "asc" }, select: { tip: true, toplam: true, tarih: true } }) : [];
  const gider = hareketler.filter(h => h.tip === "GIRIS").reduce((sum, h) => sum + h.toplam.toNumber(), 0);
  const cikis = hareketler.filter(h => h.tip === "CIKIS").reduce((sum, h) => sum + h.toplam.toNumber(), 0);
  const map = new Map<string, ChartRow>();
  for (const h of hareketler) { const key = `${h.tarih.getFullYear()}-${String(h.tarih.getMonth() + 1).padStart(2, "0")}`; const row = map.get(key) ?? { ay: new Intl.DateTimeFormat("tr-TR", { month: "short", year: "2-digit" }).format(h.tarih), gider: 0, cikis: 0 }; row[h.tip === "GIRIS" ? "gider" : "cikis"] += h.toplam.toNumber(); map.set(key, row); }
  const cards = [{ title: "Toplam gider", value: gider, icon: ArrowDownToLine, color: "text-red-700" }, { title: "Toplam çıkış", value: cikis, icon: ArrowUpFromLine, color: "text-emerald-700" }, { title: "Net durum", value: cikis - gider, icon: Scale, color: cikis - gider >= 0 ? "text-emerald-700" : "text-red-700" }];
  return <div className="space-y-6"><div><p className="text-sm text-slate-500">Mali Görünüm</p><h1 className="text-2xl font-bold">Raporlar</h1></div><form className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4"><label className="grid gap-1 text-sm font-medium">Başlangıç<input className="h-10 rounded-lg border px-3 font-normal" type="date" name="baslangic" defaultValue={baslangicText}/></label><label className="grid gap-1 text-sm font-medium">Bitiş<input className="h-10 rounded-lg border px-3 font-normal" type="date" name="bitis" defaultValue={bitisText}/></label><Button type="submit">Raporu getir</Button></form>
    <section className="grid gap-4 sm:grid-cols-3">{cards.map(({ title, value, icon: Icon, color }) => <Card key={title}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-slate-600">{title}</CardTitle><Icon className={`size-5 ${color}`}/></CardHeader><CardContent><p className="text-2xl font-bold">{paraFormat.format(value)}</p></CardContent></Card>)}</section>
    <Card><CardHeader><CardTitle>Aylık gider ve çıkış</CardTitle></CardHeader><CardContent><AylikChart data={[...map.values()]}/></CardContent></Card></div>;
}
