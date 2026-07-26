"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HareketRow } from "@/components/hareketler/hareket-table";
import { csvOlustur } from "@/lib/csv";

export function CsvButton({ rows }: { rows: HareketRow[] }) {
  function download() {
    const csv = csvOlustur(["Tarih", "Ürün", "Tip", "Miktar", "Birim", "Birim Fiyat", "Toplam", "Açıklama"], rows.map(row => [new Date(row.tarih).toLocaleDateString("tr-TR"), row.urun, row.tip === "GIRIS" ? "Giren ürün" : "Çıkan ürün", row.miktar, row.birim, row.birimFiyat.toFixed(2), row.toplam.toFixed(2), row.aciklama ?? ""]));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `stok-hareketleri-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <Button variant="outline" onClick={download} disabled={!rows.length}><Download className="size-4"/>CSV İndir</Button>;
}
