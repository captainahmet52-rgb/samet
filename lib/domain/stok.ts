export type HareketTipi = "GIRIS" | "CIKIS";

export function stokDegisimi(tip: HareketTipi, miktar: number) {
  return tip === "GIRIS" ? miktar : -miktar;
}

export function toplamHesapla(miktar: number, birimFiyat: number) {
  return Math.round(miktar * birimFiyat * 100) / 100;
}
