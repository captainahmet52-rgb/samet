"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, CameraOff, Link2, PackagePlus, Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { barkodBagla, barkodIleUrun, type BarkodUrun } from "@/lib/actions/barkod";
import { hareketEkle } from "@/lib/actions/hareket";
import { cn, paraFormat } from "@/lib/utils";

type Scanner = { stop: () => Promise<void>; clear: () => void };
type Mode = "GIRIS" | "CIKIS";

const OKUYUCU_ID = "barkod-okuyucu";

export function BarkodClient({ urunler }: { urunler: Array<{ id: string; ad: string }> }) {
  const [mode, setMode] = useState<Mode>("GIRIS");
  const [scanning, setScanning] = useState(false);
  const [barkod, setBarkod] = useState("");
  const [urun, setUrun] = useState<BarkodUrun | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pending, setPending] = useState(false);
  const scannerRef = useRef<Scanner | null>(null);

  useEffect(() => () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
  }, []);

  async function stopScanner() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    if (scanner) { try { await scanner.stop(); scanner.clear(); } catch { /* kamera zaten kapalı */ } }
  }

  async function startScanner() {
    if (scannerRef.current) return;
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(OKUYUCU_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        kod => { void stopScanner(); void barkodIsle(kod); },
        () => {},
      );
    } catch {
      scannerRef.current = null;
      setScanning(false);
      toast.error("Kamera açılamadı. Tarayıcıda kamera iznini kontrol edin.");
    }
  }

  async function barkodIsle(kod: string) {
    setPending(true); setUrun(null); setNotFound(false); setBarkod(kod);
    const result = await barkodIleUrun(kod);
    setPending(false);
    if (!result.ok) return void toast.error(result.message);
    if (result.urun) setUrun(result.urun);
    else setNotFound(true);
  }

  async function girisKaydet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!urun) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    const result = await hareketEkle({ urunId: urun.id, tip: "GIRIS", miktar: form.get("miktar"), birimFiyat: form.get("fiyat"), tarih: new Date().toISOString(), aciklama: "Barkod ile giriş" });
    setPending(false);
    if (!result.ok) return void toast.error(result.message);
    toast.success("Giriş kaydedildi.");
    void barkodIsle(barkod);
  }

  async function satisKaydet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!urun) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    const result = await hareketEkle({ urunId: urun.id, tip: "CIKIS", miktar: form.get("miktar"), birimFiyat: urun.fiyat, tarih: new Date().toISOString(), aciklama: "Barkod ile satış" });
    setPending(false);
    if (!result.ok) return void toast.error(result.message);
    toast.success("Satıldı, stoktan düşüldü.");
    void barkodIsle(barkod);
  }

  async function bagla(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const result = await barkodBagla(form.get("urunId"), barkod);
    setPending(false);
    if (!result.ok) return void toast.error(result.message);
    toast.success(result.message);
    void barkodIsle(barkod);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button className="h-12" variant={mode === "GIRIS" ? "default" : "outline"} onClick={() => setMode("GIRIS")}><PackagePlus className="size-4"/>Mal Girişi</Button>
        <Button className="h-12" variant={mode === "CIKIS" ? "default" : "outline"} onClick={() => setMode("CIKIS")}><ShoppingCart className="size-4"/>Satış</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Barkod okut</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div id={OKUYUCU_ID} className={cn("overflow-hidden rounded-lg", scanning && "min-h-40 border bg-black")} />
          {scanning
            ? <Button className="w-full" variant="outline" onClick={() => void stopScanner()}><CameraOff className="size-4"/>Kamerayı kapat</Button>
            : <Button className="w-full" onClick={() => void startScanner()}><Camera className="size-4"/>Kamerayla okut</Button>}
          <form className="flex gap-2" onSubmit={event => { event.preventDefault(); const kod = String(new FormData(event.currentTarget).get("manuel") ?? "").trim(); if (kod) void barkodIsle(kod); }}>
            <Input aria-label="Barkod numarası" inputMode="numeric" name="manuel" placeholder="veya barkodu elle yazın" />
            <Button aria-label="Barkodu ara" type="submit" variant="outline"><Search className="size-4"/></Button>
          </form>
        </CardContent>
      </Card>

      {urun && (
        <Card key={`${urun.id}-${urun.mevcutStok}-${mode}`}>
          <CardHeader>
            <CardTitle className="text-base">{urun.ad}</CardTitle>
            <p className="text-sm text-slate-500">Barkod: {barkod}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Mevcut stok</p><p className="text-xl font-bold">{urun.mevcutStok} {urun.birim}</p></div>
              <div className="rounded-lg bg-emerald-50 p-3"><p className="text-xs text-slate-500">Fiyat</p><p className="text-xl font-bold text-emerald-800">{paraFormat.format(urun.fiyat)}</p></div>
            </div>
            {mode === "GIRIS" ? (
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={girisKaydet}>
                <div className="space-y-1.5"><Label htmlFor="giris-miktar">Gelen miktar</Label><Input defaultValue={1} id="giris-miktar" min="1" name="miktar" required type="number" /></div>
                <div className="space-y-1.5"><Label htmlFor="giris-fiyat">Birim fiyat (₺)</Label><Input defaultValue={urun.fiyat} id="giris-fiyat" min="0" name="fiyat" required step="0.01" type="number" /></div>
                <Button className="h-12 sm:col-span-2" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
              </form>
            ) : (
              <form className="grid gap-3" onSubmit={satisKaydet}>
                <div className="space-y-1.5"><Label htmlFor="satis-miktar">Satılan miktar</Label><Input defaultValue={1} id="satis-miktar" min="1" name="miktar" required type="number" /></div>
                <Button className="h-12" disabled={pending || urun.mevcutStok < 1}>{pending ? "Kaydediliyor…" : urun.mevcutStok < 1 ? "Stok yok" : "Satıldı"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {notFound && (
        <Card>
          <CardHeader><CardTitle className="text-base">Barkod kayıtlı değil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600"><span className="font-semibold">{barkod}</span> numaralı barkod hiçbir üründe kayıtlı değil. Aşağıdan bir ürüne bağlayabilir ya da önce Ürünler sayfasından yeni ürün ekleyebilirsiniz.</p>
            <form className="flex flex-wrap gap-2" onSubmit={bagla}>
              <select aria-label="Barkodun bağlanacağı ürün" className="h-10 min-w-48 flex-1 rounded-lg border bg-white px-3 text-sm" defaultValue="" name="urunId" required>
                <option value="" disabled>Ürün seçin</option>
                {urunler.map(u => <option key={u.id} value={u.id}>{u.ad}</option>)}
              </select>
              <Button disabled={pending} type="submit"><Link2 className="size-4"/>Barkodu bağla</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
