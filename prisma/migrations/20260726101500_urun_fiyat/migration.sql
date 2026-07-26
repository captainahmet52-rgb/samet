-- Ürüne fiyat kolonu ekle
ALTER TABLE "Urun" ADD COLUMN "fiyat" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Mevcut ürünlerin fiyatını en son giriş hareketindeki birim fiyattan doldur
UPDATE "Urun" u
SET "fiyat" = h."birimFiyat"
FROM (
  SELECT DISTINCT ON ("urunId") "urunId", "birimFiyat"
  FROM "StokHareket"
  WHERE "tip" = 'GIRIS'
  ORDER BY "urunId", "tarih" DESC
) h
WHERE h."urunId" = u."id";
