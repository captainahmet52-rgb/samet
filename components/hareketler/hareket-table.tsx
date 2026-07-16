"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { hareketSil } from "@/lib/actions/hareket";
import { paraFormat, tarihFormat } from "@/lib/utils";

export type HareketRow = { id: string; tarih: string; urun: string; birim: string; tip: "GIRIS" | "CIKIS"; miktar: number; birimFiyat: number; toplam: number; aciklama: string | null };

function DeleteAction({ hareket }: { hareket: HareketRow }) {
  const [pending, setPending] = useState(false);
  async function remove() {
    if (!confirm("Bu hareket silinecek ve ürün stoku geri hesaplanacak. Emin misiniz?")) return;
    setPending(true); const result = await hareketSil(hareket.id); setPending(false);
    if (result.ok) toast.success(result.message); else toast.error(result.message);
  }
  return <Button aria-label="Hareketi sil" disabled={pending} size="icon" variant="ghost" onClick={remove}><Trash2 className="size-4 text-red-700"/></Button>;
}

export const hareketColumns: ColumnDef<HareketRow>[] = [
  { accessorKey: "tarih", header: "Tarih", cell: ({ row }) => tarihFormat.format(new Date(row.original.tarih)) },
  { accessorKey: "urun", header: "Ürün" },
  { accessorKey: "tip", header: "Tip", cell: ({ row }) => <span className={row.original.tip === "GIRIS" ? "rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800" : "rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800"}>{row.original.tip === "GIRIS" ? "Giriş" : "Çıkış"}</span> },
  { accessorKey: "miktar", header: "Miktar", cell: ({ row }) => `${row.original.miktar} ${row.original.birim}` },
  { accessorKey: "birimFiyat", header: "Birim Fiyat", cell: ({ row }) => paraFormat.format(row.original.birimFiyat) },
  { accessorKey: "toplam", header: "Toplam", cell: ({ row }) => <span className="font-semibold">{paraFormat.format(row.original.toplam)}</span> },
  { accessorKey: "aciklama", header: "Açıklama", cell: ({ row }) => <span className="block max-w-56 truncate text-slate-600">{row.original.aciklama || "—"}</span> },
  { id: "actions", cell: ({ row }) => <DeleteAction hareket={row.original}/> },
];

export function HareketTable({ data }: { data: HareketRow[] }) { return <DataTable columns={hareketColumns} data={data} emptyText="Henüz stok hareketi yok."/>; }
