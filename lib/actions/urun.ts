"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import { urunSchema, yeniUrunSchema } from "@/lib/validations/urun";

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

function ensureDatabase() {
  if (!isDatabaseConfigured()) throw new Error("Veritabanı bağlantısı yapılandırılmamış.");
}

function hataMesaji(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Bu barkod zaten başka bir üründe kayıtlı.";
  }
  return error instanceof Error ? error.message : fallback;
}

export async function urunEkle(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const { ilkMiktar, birimFiyat, gelisTarihi, ...urunData } = yeniUrunSchema.parse(input);
    // Ürün kartındaki fiyat, ilk giriş hareketinin birim fiyatından başlar.
    const fiyat = new Prisma.Decimal(birimFiyat.toFixed(2));
    await prisma.$transaction(async tx => {
      const urun = await tx.urun.create({ data: { ...urunData, mevcutStok: ilkMiktar, fiyat } });
      await tx.stokHareket.create({
        data: {
          urunId: urun.id,
          tip: "GIRIS",
          miktar: ilkMiktar,
          birimFiyat: fiyat,
          toplam: fiyat.mul(ilkMiktar),
          tarih: gelisTarihi,
          aciklama: "İlk stok girişi",
        },
      });
    });
    revalidatePath("/urunler"); revalidatePath("/hareketler"); revalidatePath("/"); revalidatePath("/rapor");
    return { ok: true, message: "Ürün ve ilk stok girişi kaydedildi." };
  } catch (error) { return { ok: false, message: hataMesaji(error, "Ürün eklenemedi.") }; }
}

export async function urunGuncelle(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const data = urunSchema.parse(input);
    await prisma.urun.update({ where: { id }, data });
    revalidatePath("/urunler"); revalidatePath("/");
    return { ok: true, message: "Ürün güncellendi." };
  } catch (error) { return { ok: false, message: hataMesaji(error, "Ürün güncellenemedi.") }; }
}

export async function urunSil(id: string): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const urun = await prisma.urun.findUnique({ where: { id }, select: { _count: { select: { hareketler: true } } } });
    if (!urun) throw new Error("Ürün bulunamadı.");
    if (urun._count.hareketler) throw new Error("Hareketi olan ürün silinemez.");
    await prisma.urun.delete({ where: { id } });
    revalidatePath("/urunler"); revalidatePath("/");
    return { ok: true, message: "Ürün silindi." };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Ürün silinemedi." }; }
}
