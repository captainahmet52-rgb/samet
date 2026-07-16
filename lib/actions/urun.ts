"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import { urunSchema } from "@/lib/validations/urun";

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

function ensureDatabase() {
  if (!isDatabaseConfigured()) throw new Error("Veritabanı bağlantısı yapılandırılmamış.");
}

export async function urunEkle(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const data = urunSchema.parse(input);
    await prisma.urun.create({ data });
    revalidatePath("/urunler"); revalidatePath("/");
    return { ok: true, message: "Ürün eklendi." };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Ürün eklenemedi." }; }
}

export async function urunGuncelle(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const data = urunSchema.parse(input);
    await prisma.urun.update({ where: { id }, data });
    revalidatePath("/urunler"); revalidatePath("/");
    return { ok: true, message: "Ürün güncellendi." };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Ürün güncellenemedi." }; }
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
