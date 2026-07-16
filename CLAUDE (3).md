# Temizlik Şirketi Depo & Stok Takip Sistemi

## Proje Özeti
Bir temizlik şirketi için basit bir **depo/stok yönetim** paneli. Amaç: temizlik ürünlerinin (deterjan, eldiven, çöp poşeti vb.) **depoya ne zaman girdiğini ve çıktığını** tablo halinde takip etmek, gider/gelir kaydını tutmak. Sadece **admin paneli** yeterli — public site zorunlu değil, istenirse basit bir tanıtım landing eklenebilir.

## Language Lock
- Tüm kod **TypeScript** ile yazılacak. Python, başka dil KULLANILMAYACAK.
- UI dili **Türkçe**. Tarih/para formatları Türkiye'ye göre (₺, gg.aa.yyyy).

## Teknoloji Stack
| Katman | Teknoloji |
|--------|-----------|
| Framework | **Next.js 15** (App Router, Server Actions) |
| Dil | TypeScript |
| Stil | Tailwind v4 + **shadcn/ui** |
| DB | **Supabase** (PostgreSQL) |
| ORM | **Prisma** |
| Auth | Supabase Auth (email + şifre, tek admin yeter) |
| Tablo/Grid | TanStack Table (shadcn data-table) |
| Form | react-hook-form + zod |
| Deploy | **Vercel** |

> Not: BullMQ / Redis GEREKSİZ, bu iş için kullanma. Overengineering yapma.

## Veri Modeli (Prisma Schema)

```prisma
model Urun {
  id          String   @id @default(cuid())
  ad          String                      // "Yüzey Temizleyici 5L"
  birim       String                      // "adet", "litre", "koli"
  kritikStok  Int      @default(0)        // altına düşünce uyarı
  mevcutStok  Int      @default(0)        // hesaplanmış anlık stok
  hareketler  StokHareket[]
  createdAt   DateTime @default(now())
}

model StokHareket {
  id        String      @id @default(cuid())
  urun      Urun        @relation(fields: [urunId], references: [id])
  urunId    String
  tip       HareketTipi                   // GIRIS | CIKIS
  miktar    Int
  birimFiyat Decimal    @db.Decimal(10,2) // birim maliyet/satış
  toplam    Decimal     @db.Decimal(10,2) // miktar * birimFiyat
  aciklama  String?                       // "X marketten alındı" / "Y şantiyeye gönderildi"
  tarih     DateTime    @default(now())
  createdAt DateTime    @default(now())
}

enum HareketTipi {
  GIRIS   // depoya giriş = gider
  CIKIS   // depodan çıkış = gelir/kullanım
}
```

## Sayfalar & Özellikler

### 1. `/login`
- Supabase Auth ile admin girişi. Tek kullanıcı yeter.

### 2. `/` (Dashboard)
- Özet kartlar: **Toplam ürün çeşidi**, **Bu ayki toplam gider**, **Bu ayki toplam gelir/çıkış**, **Kritik stoktaki ürün sayısı**.
- Son 10 stok hareketi mini tablosu.

### 3. `/urunler`
- Ürün listesi (data-table): Ad, Birim, Mevcut Stok, Kritik Stok, Durum (kritikse kırmızı badge).
- "Yeni Ürün Ekle" modal.

### 4. `/hareketler` — **ANA TABLO**
- Tüm giriş/çıkış hareketleri tablo halinde. Kolonlar:
  | Tarih | Ürün | Tip (Giriş/Çıkış) | Miktar | Birim Fiyat | Toplam | Açıklama |
- Filtreler: tarih aralığı, ürüne göre, tip (giriş/çıkış).
- "Yeni Hareket" butonu → modal (ürün seç, tip, miktar, fiyat, tarih, açıklama).
- Hareket eklenince ilgili ürünün `mevcutStok` değeri otomatik güncellenir (Server Action + transaction).
- Excel/CSV export butonu.

### 5. `/rapor` (opsiyonel ama tavsiye)
- Aylık gider/gelir özeti (basit bar chart — recharts).
- Tarih aralığı seçip toplam gider, toplam çıkış, net durum.

## İş Kuralları
- **GIRIS** hareketi → `mevcutStok += miktar`, gider olarak sayılır.
- **CIKIS** hareketi → `mevcutStok -= miktar`. Stok yetersizse hata ver, kaydetme.
- `toplam` her zaman backend'de hesaplanır, client'a güvenme.
- Stok güncellemeleri Prisma **transaction** içinde yapılacak (race condition olmasın).

## Klasör Yapısı
```
app/
  (auth)/login/
  (dashboard)/
    page.tsx          # dashboard
    urunler/
    hareketler/
    rapor/
  layout.tsx
components/
  ui/                 # shadcn
  data-table/
lib/
  prisma.ts
  supabase.ts
  actions/            # server actions (urun.ts, hareket.ts)
prisma/
  schema.prisma
```

## Yol Haritası (Fazlar)
1. **Faz 1** — Proje kurulum: Next.js 15 + Tailwind v4 + shadcn + Prisma + Supabase bağlantısı, schema migrate.
2. **Faz 2** — Auth + korumalı layout.
3. **Faz 3** — Ürün CRUD.
4. **Faz 4** — Stok hareketleri + otomatik stok güncelleme (ana özellik).
5. **Faz 5** — Dashboard özet kartları + son hareketler.
6. **Faz 6** — Filtreler, CSV export, rapor sayfası.
7. **Faz 7** — Deploy (Vercel + Supabase prod).

## Notlar
- Mobil uyumlu olsun, depo görevlisi telefondan da hareket ekleyebilmeli.
- Silme işlemlerinde onay modalı iste (hareket silinince stok geri hesaplansın).
