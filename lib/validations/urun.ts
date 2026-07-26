import { z } from "zod";

export const urunSchema = z.object({
  ad: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı.").max(100),
  birim: z.string().trim().min(1, "Birim seçin.").max(30),
  kritikStok: z.coerce.number().int().min(0, "Kritik stok negatif olamaz.").max(1_000_000),
  fiyat: z.coerce.number().min(0, "Fiyat negatif olamaz.").max(100_000_000),
  barkod: z.string().trim().max(64).optional().nullable().transform(value => value || null),
});

export const yeniUrunSchema = urunSchema.omit({ fiyat: true }).extend({
  ilkMiktar: z.coerce.number().int().positive("İlk giriş miktarı sıfırdan büyük olmalı.").max(1_000_000),
  birimFiyat: z.coerce.number().min(0, "Birim fiyat negatif olamaz.").max(100_000_000),
  gelisTarihi: z.coerce.date(),
});

export type UrunInput = z.infer<typeof urunSchema>;
