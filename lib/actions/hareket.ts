"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/urun";
import { hareketSchema } from "@/lib/validations/hareket";

function ensureDatabase() {
  if (!isDatabaseConfigured()) throw new Error("Veritabanı bağlantısı yapılandırılmamış.");
}

function refresh() {
  revalidatePath("/hareketler"); revalidatePath("/urunler"); revalidatePath("/"); revalidatePath("/rapor");
}

export async function hareketEkle(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const data = hareketSchema.parse(input);
    const toplam = new Prisma.Decimal(data.birimFiyat.toFixed(2)).mul(data.miktar);
    await prisma.$transaction(async tx => {
      if (data.tip === "CIKIS") {
        const updated = await tx.urun.updateMany({ where: { id: data.urunId, mevcutStok: { gte: data.miktar } }, data: { mevcutStok: { decrement: data.miktar } } });
        if (updated.count !== 1) throw new Error("Stok yetersiz veya ürün bulunamadı.");
      } else {
        // Girişte ürün kartındaki fiyat son alış fiyatına güncellenir.
        const urun = await tx.urun.update({ where: { id: data.urunId }, data: { mevcutStok: { increment: data.miktar }, fiyat: new Prisma.Decimal(data.birimFiyat.toFixed(2)) } });
        if (!urun) throw new Error("Ürün bulunamadı.");
      }
      await tx.stokHareket.create({ data: { ...data, birimFiyat: new Prisma.Decimal(data.birimFiyat.toFixed(2)), toplam } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    refresh();
    return { ok: true, message: "Stok hareketi kaydedildi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Hareket kaydedilemedi." };
  }
}

export async function hareketSil(id: string): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    await prisma.$transaction(async tx => {
      const hareket = await tx.stokHareket.findUnique({ where: { id } });
      if (!hareket) throw new Error("Hareket bulunamadı.");
      if (hareket.tip === "GIRIS") {
        const updated = await tx.urun.updateMany({ where: { id: hareket.urunId, mevcutStok: { gte: hareket.miktar } }, data: { mevcutStok: { decrement: hareket.miktar } } });
        if (updated.count !== 1) throw new Error("Bu giriş silinirse stok negatif olur. Önce sonraki çıkışları düzeltin.");
      } else {
        await tx.urun.update({ where: { id: hareket.urunId }, data: { mevcutStok: { increment: hareket.miktar } } });
      }
      await tx.stokHareket.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    refresh();
    return { ok: true, message: "Hareket silindi ve stok güncellendi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Hareket silinemedi." };
  }
}
