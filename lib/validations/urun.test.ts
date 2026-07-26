import { describe, expect, it } from "vitest";
import { urunSchema, yeniUrunSchema } from "./urun";

describe("urunSchema", () => {
  it("geçerli ürün bilgisini kabul eder", () => {
    expect(urunSchema.parse({ ad: "Yüzey Temizleyici", birim: "litre", kritikStok: "5", fiyat: "125.50" })).toEqual({ ad: "Yüzey Temizleyici", birim: "litre", kritikStok: 5, fiyat: 125.5 });
  });

  it("negatif kritik stoku reddeder", () => {
    expect(urunSchema.safeParse({ ad: "Eldiven", birim: "kutu", kritikStok: -1, fiyat: 10 }).success).toBe(false);
  });

  it("negatif fiyatı reddeder", () => {
    expect(urunSchema.safeParse({ ad: "Eldiven", birim: "kutu", kritikStok: 1, fiyat: -5 }).success).toBe(false);
  });

  it("yeni ürünün ilk giriş ve tarih bilgisini doğrular", () => {
    const result = yeniUrunSchema.parse({
      ad: "Çöp Poşeti",
      birim: "koli",
      kritikStok: 2,
      ilkMiktar: 10,
      birimFiyat: 125.5,
      gelisTarihi: "2026-07-17T12:00:00",
    });
    expect(result.ilkMiktar).toBe(10);
    expect(result.gelisTarihi).toBeInstanceOf(Date);
  });
});
