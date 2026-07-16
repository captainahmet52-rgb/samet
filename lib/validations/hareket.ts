import { z } from "zod";

export const hareketSchema = z.object({
  urunId: z.string().min(1, "Ürün seçin."),
  tip: z.enum(["GIRIS", "CIKIS"]),
  miktar: z.coerce.number().int().positive("Miktar sıfırdan büyük olmalı.").max(1_000_000),
  birimFiyat: z.coerce.number().min(0, "Birim fiyat negatif olamaz.").max(100_000_000),
  tarih: z.coerce.date(),
  aciklama: z.string().trim().max(500).optional().transform(value => value || undefined),
});

export type HareketInput = z.infer<typeof hareketSchema>;
