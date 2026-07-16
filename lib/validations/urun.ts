import { z } from "zod";

export const urunSchema = z.object({
  ad: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı.").max(100),
  birim: z.string().trim().min(1, "Birim seçin.").max(30),
  kritikStok: z.coerce.number().int().min(0, "Kritik stok negatif olamaz.").max(1_000_000),
});

export type UrunInput = z.infer<typeof urunSchema>;
