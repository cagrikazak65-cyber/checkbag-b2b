# PostgreSQL Geçiş Notları

Bu proje lokal geliştirmede SQLite kullanır. Production için PostgreSQL önerilir.

## Lokal PostgreSQL Başlatma

Docker yüklüyse:

```bash
docker compose up -d postgres
```

PostgreSQL bağlantı adresi:

```env
DATABASE_URL="postgresql://checkbag:checkbag_password@localhost:5432/checkbag_b2b?schema=public"
```

## Önemli Prisma Notu

`prisma/schema.prisma` içinde datasource provider şu an SQLite:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

PostgreSQL'e geçerken provider değeri değiştirilmelidir:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Prisma provider değeri `.env` ile dinamik değiştirilemez. Bu yüzden SQLite'tan PostgreSQL'e geçiş bir schema/migration kararıdır.

## Yeni Production Kurulumu

Production verisi yoksa en temiz yol:

1. `DATABASE_URL` değerini PostgreSQL bağlantısına çevir.
2. `prisma/schema.prisma` içindeki provider değerini `postgresql` yap.
3. SQLite'a özel eski migration geçmişini production için kullanma.
4. PostgreSQL için temiz migration oluştur:

```bash
npx prisma migrate dev --name init_postgres
```

5. Prisma Client üret:

```bash
npx prisma generate
```

6. Başlangıç verisini bas:

```bash
npm run seed
```

## Mevcut SQLite Verisini Taşıma

Eğer SQLite içinde korunması gereken gerçek veri varsa:

1. SQLite verisini dışa aktar.
2. PostgreSQL şemasını kur.
3. Veriyi tablo sırasına göre içe aktar:
   - `User`
   - `Customer`
   - `Product`
   - `Order`
   - `OrderItem`
   - `CartItem`
4. İlişkileri ve unique alanları kontrol et.
5. `priceCents`, `totalAmountCents`, `priceCents` snapshot alanlarının dolu olduğundan emin ol.

## Production Checklist

- `AUTH_SECRET` güçlü ve gizli olmalı.
- `DATABASE_URL` production PostgreSQL'e bakmalı.
- `NODE_ENV=production` olmalı.
- `/api/seed` production'da kapalı kalmalı.
- Ürün görselleri için lokal disk yerine kalıcı storage tercih edilmeli.
- HTTPS arkasında session cookie `secure` olarak çalışır.
