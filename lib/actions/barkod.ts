"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/urun";

const barkodSchema = z.string().trim().min(1, "Barkod okunamadı.").max(64);

export type BarkodUrun = {
  id: string;
  ad: string;
  birim: string;
  mevcutStok: number;
  kritikStok: number;
  fiyat: number;
  barkod: string | null;
};

type BarkodSonuc = { ok: true; urun: BarkodUrun | null } | { ok: false; message: string };

function ensureDatabase() {
  if (!isDatabaseConfigured()) throw new Error("Veritabanı bağlantısı yapılandırılmamış.");
}

export async function barkodIleUrun(input: unknown): Promise<BarkodSonuc> {
  try {
    await requireAdmin(); ensureDatabase();
    const barkod = barkodSchema.parse(input);
    const urun = await prisma.urun.findUnique({
      where: { barkod },
      select: { id: true, ad: true, birim: true, mevcutStok: true, kritikStok: true, fiyat: true, barkod: true },
    });
    return { ok: true, urun: urun ? { ...urun, fiyat: urun.fiyat.toNumber() } : null };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Barkod sorgulanamadı." };
  }
}

export async function barkodBagla(urunId: unknown, input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin(); ensureDatabase();
    const id = z.string().min(1, "Ürün seçin.").parse(urunId);
    const barkod = barkodSchema.parse(input);
    await prisma.urun.update({ where: { id }, data: { barkod } });
    revalidatePath("/urunler");
    return { ok: true, message: "Barkod ürüne bağlandı." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Bu barkod zaten başka bir üründe kayıtlı." };
    }
    return { ok: false, message: error instanceof Error ? error.message : "Barkod bağlanamadı." };
  }
}
