import { describe, expect, it } from "vitest";
import { csvOlustur } from "./csv";

describe("csvOlustur", () => {
  it("Türkçe Excel uyumlu BOM ve noktalı virgül kullanır", () => {
    expect(csvOlustur(["Ürün", "Tutar"], [["Deterjan", 10]])).toBe('\uFEFF"Ürün";"Tutar"\r\n"Deterjan";"10"');
  });
  it("formül enjeksiyonunu etkisizleştirir", () => {
    expect(csvOlustur(["Açıklama"], [["=CMD()"]])).toContain("'=CMD()");
  });
});
