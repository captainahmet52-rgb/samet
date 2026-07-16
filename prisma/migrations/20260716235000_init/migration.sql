-- CreateEnum
CREATE TYPE "HareketTipi" AS ENUM ('GIRIS', 'CIKIS');

-- CreateTable
CREATE TABLE "Urun" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "birim" TEXT NOT NULL,
    "kritikStok" INTEGER NOT NULL DEFAULT 0,
    "mevcutStok" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Urun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokHareket" (
    "id" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "tip" "HareketTipi" NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "toplam" DECIMAL(10,2) NOT NULL,
    "aciklama" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StokHareket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StokHareket_urunId_idx" ON "StokHareket"("urunId");
CREATE INDEX "StokHareket_tarih_idx" ON "StokHareket"("tarih");
CREATE INDEX "StokHareket_tip_idx" ON "StokHareket"("tip");

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
