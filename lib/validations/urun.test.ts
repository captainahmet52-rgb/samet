import { describe, expect, it } from "vitest";
import { urunSchema } from "./urun";

describe("urunSchema", () => {
  it("geçerli ürün bilgisini kabul eder", () => {
    expect(urunSchema.parse({ ad: "Yüzey Temizleyici", birim: "litre", kritikStok: "5" })).toEqual({ ad: "Yüzey Temizleyici", birim: "litre", kritikStok: 5 });
  });

  it("negatif kritik stoku reddeder", () => {
    expect(urunSchema.safeParse({ ad: "Eldiven", birim: "kutu", kritikStok: -1 }).success).toBe(false);
  });
});
