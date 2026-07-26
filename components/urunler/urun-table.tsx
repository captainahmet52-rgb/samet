"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { UrunForm } from "@/components/urunler/urun-form";
import { Button } from "@/components/ui/button";
import { urunSil } from "@/lib/actions/urun";
import { paraFormat } from "@/lib/utils";

export type UrunRow = { id: string; ad: string; birim: string; mevcutStok: number; kritikStok: number; fiyat: number };

function Actions({ urun }: { urun: UrunRow }) {
  const [pending, setPending] = useState(false);
  async function remove() {
    if (!confirm(`“${urun.ad}” ürününü silmek istediğinize emin misiniz?`)) return;
    setPending(true); const result = await urunSil(urun.id); setPending(false);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }
  return <div className="flex justify-end gap-1"><UrunForm urun={urun} trigger={<Button aria-label="Düzenle" size="icon" variant="ghost"><Pencil className="size-4"/></Button>}/><Button aria-label="Sil" disabled={pending} size="icon" variant="ghost" onClick={remove}><Trash2 className="size-4 text-red-700"/></Button></div>;
}

export const columns: ColumnDef<UrunRow>[] = [
  { accessorKey: "ad", header: ({ column }) => <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Ürün <ArrowUpDown className="size-3"/></button> },
  { accessorKey: "birim", header: "Birim" },
  { accessorKey: "mevcutStok", header: "Mevcut Stok", cell: ({ row }) => <span className="font-semibold">{row.original.mevcutStok} {row.original.birim}</span> },
  { accessorKey: "fiyat", header: "Fiyat", cell: ({ row }) => paraFormat.format(row.original.fiyat) },
  { id: "durum", header: "Durum", cell: ({ row }) => row.original.mevcutStok <= row.original.kritikStok ? <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Kritik</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Yeterli</span> },
  { id: "actions", cell: ({ row }) => <Actions urun={row.original}/> },
];

export function UrunTable({ data, emptyText }: { data: UrunRow[]; emptyText?: string }) { return <DataTable columns={columns} data={data} emptyText={emptyText ?? "Henüz ürün eklenmedi."}/>; }
