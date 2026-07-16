# Temizlik Deposu — Stok Yönetimi

Next.js 15, TypeScript, Tailwind CSS v4, Supabase Auth ve Prisma/PostgreSQL ile hazırlanmış mobil uyumlu depo paneli.

## Özellikler

- Supabase e-posta/şifre girişi ve korumalı yönetim paneli
- Ürün ekleme, düzenleme ve güvenli silme
- Transaction içinde stok giriş/çıkış işlemleri ve yetersiz stok kontrolü
- Hareket silindiğinde stok etkisini geri alma
- Aylık gider/çıkış özeti, kritik stok uyarıları ve son hareketler
- Tarih, ürün ve hareket tipi filtreleri
- Excel uyumlu, formül enjeksiyonuna karşı korumalı CSV dışa aktarma
- Tarih aralıklı rapor ve aylık grafik

## Yerel kurulum

1. Bağımlılıkları kurun: `npm install`
2. `.env.example` dosyasını `.env` olarak kopyalayıp Supabase değerlerini girin.
3. Supabase Authentication > Users bölümünden yönetici kullanıcısını oluşturun.
4. Şemayı uygulayın: `npm run db:deploy`
5. Uygulamayı başlatın: `npm run dev`

`DATABASE_URL` uygulama için port 6543 üzerindeki transaction pooler adresi, `DIRECT_URL` ise migration için port 5432 doğrudan bağlantı olmalıdır.

## Kontroller

```text
npm test
npm run lint
npm run typecheck
npm run build
```

## Vercel dağıtımı

1. Projeyi bir Git deposuna gönderip Vercel'e bağlayın.
2. Vercel Project Settings > Environment Variables alanına `.env.example` içindeki dört değişkeni ekleyin.
3. Build Command olarak `npm run vercel-build` kullanın. Bu komut Prisma Client üretir, bekleyen migration'ları uygular ve Next.js üretim derlemesini oluşturur.
4. Supabase Authentication > URL Configuration içinde Vercel alan adını Site URL olarak tanımlayın.

Gizli `.env` dosyaları Git'e dahil edilmez.
