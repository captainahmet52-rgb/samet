import { describe, expect, it } from "vitest";
import { stokDegisimi, toplamHesapla } from "./stok";

describe("stok iş kuralları", () => {
  it("girişi artırır, çıkışı azaltır", () => {
    expect(stokDegisimi("GIRIS", 5)).toBe(5);
    expect(stokDegisimi("CIKIS", 5)).toBe(-5);
  });

  it("toplamı kuruşa yuvarlar", () => {
    expect(toplamHesapla(3, 12.345)).toBe(37.04);
  });
});
