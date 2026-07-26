-- Ürüne barkod kolonu ekle
ALTER TABLE "Urun" ADD COLUMN "barkod" TEXT;

-- Aynı barkod iki üründe kullanılamaz
CREATE UNIQUE INDEX "Urun_barkod_key" ON "Urun"("barkod");
