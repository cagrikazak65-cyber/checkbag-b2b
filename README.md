# Check Bag B2B

Check Bag B2B, kapalı devre çalışan bir toptan satış panelidir. Admin ürün, müşteri ve sipariş yönetir; yetkili müşteriler ürünleri görür, sepete ekler ve sipariş oluşturur.

## Teknoloji

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Prisma 5
- SQLite

## Kurulum

Bağımlılıkları yükle:

```bash
npm install
```

Ortam değişkenlerini hazırla. Lokal geliştirme için `.env` içinde şu değerler bulunmalı:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="uzun-rastgele-bir-secret"
```

`AUTH_SECRET` production ortamında mutlaka farklı ve güçlü bir değer olmalı.

Örnek ortam dosyası:

```bash
cp .env.example .env
```

## Veritabanı

Bu projede lokal veritabanı SQLite dosyasıdır.

Prisma `DATABASE_URL` değerini `prisma/schema.prisma` dosyasına göre çözdüğü için aktif lokal dosya şurada oluşur:

```txt
prisma/prisma/dev.db
```

Migration çalıştırmak için:

```bash
npx prisma migrate dev
```

Prisma Client üretmek için:

```bash
npx prisma generate
```

Veritabanını görsel olarak incelemek için:

```bash
npx prisma studio
```

Genellikle şu adreste açılır:

```txt
http://localhost:5555
```

Kısa komutlar:

```bash
npm run db:migrate
npm run db:generate
npm run db:studio
```

## PostgreSQL Hazırlığı

Production için PostgreSQL önerilir. Lokal PostgreSQL denemesi için Docker Compose dosyası eklidir:

```bash
npm run postgres:up
```

Örnek PostgreSQL bağlantısı:

```env
DATABASE_URL="postgresql://checkbag:checkbag_password@localhost:5432/checkbag_b2b?schema=public"
```

Detaylı geçiş notları:

```txt
docs/postgresql.md
```

## Seed

Başlangıç admin, müşteri ve örnek ürünleri oluşturmak için:

```bash
npm run seed
```

Seed şu kullanıcıları oluşturur veya günceller:

```txt
Admin
Kullanıcı adı: admin
Şifre: 14531453

Müşteri
Kullanıcı adı: musteri1
Şifre: 123456
```

Şifreler veritabanında düz metin olarak tutulmaz; `scrypt` hash formatında saklanır.

Not: `/api/seed` endpoint’i production ortamında kapalıdır. Lokal geliştirmede seed için tercihen `npm run seed` kullan.

## Geliştirme

Dev server’ı başlat:

```bash
npm run dev
```

Next.js port `3000` doluysa otomatik olarak `3001`, `3002` gibi başka bir porta geçebilir. Terminalde yazan portu kullan.

Bazı ortamlarda `localhost` yerine `127.0.0.1` daha sorunsuz çalışır:

```txt
http://127.0.0.1:3001
```

Sabit portla başlatmak istersen:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Eğer girişte sorun yaşarsan tarayıcıdaki `checkbag_session` cookie’sini silip tekrar giriş yap.

## Test Akışı

Admin akışı:

1. `admin / 14531453` ile giriş yap.
2. `/admin/products` sayfasından ürün ekle veya düzenle.
3. `/admin/customers` sayfasından müşteri ekle veya düzenle.
4. `/admin/orders` sayfasından sipariş durumunu değiştir.

Müşteri akışı:

1. `musteri1 / 123456` ile giriş yap.
2. `/products` sayfasında ürünleri gör.
3. Ürünü sepete ekle.
4. `/cart` sayfasında sepeti kontrol et.
5. `/checkout` sayfasından sipariş oluştur.
6. `/orders` sayfasında sipariş geçmişini gör.

## Görseller

Ürün görselleri admin panelinden yüklenir.

Dosyalar şu klasöre kaydedilir:

```txt
public/uploads/products/
```

Veritabanında görselin kendisi değil, URL yolu saklanır:

```txt
/uploads/products/ornek-dosya.webp
```

`public/uploads/` git’e eklenmez.

## Para Alanları

Ürün fiyatı kullanıcıya string olarak gösterilir:

```txt
45,50
```

Hesaplamalar ise kuruş bazlı integer alanlarla yapılır:

```txt
priceCents: 4550
totalAmountCents: 4550
```

Bu yapı toplam ve sipariş hesaplarında string parse hatalarını azaltır.

## Auth ve Güvenlik

- Oturum `checkbag_session` adlı HttpOnly cookie ile tutulur.
- Cookie değeri HMAC imzalı session token’dır.
- Şifreler `scrypt` ile hash’lenir.
- Admin ve müşteri API’lerinde server-side yetki kontrolü vardır.
- Domain değerleri merkezi olarak doğrulanır:
  - roller
  - kayıt durumları
  - stok tipleri
  - sipariş durumları

Production öncesi dikkat edilmesi gerekenler:

- `AUTH_SECRET` production ortamında güçlü ve gizli tutulmalı.
- SQLite yerine PostgreSQL gibi production’a uygun bir veritabanı tercih edilmeli.
- Ürün görselleri için lokal disk yerine kalıcı object storage kullanılmalı.
- HTTPS arkasında cookie için `secure` ayarı eklenmeli.

## Komutlar

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed
npm run db:migrate
npm run db:generate
npm run db:studio
npm run postgres:up
npm run postgres:down
npx prisma studio
```

## Bilinen Uyarılar

`npm run lint` şu anda hata vermez, ancak bazı dosyalarda `<img>` için `next/image` öneri uyarıları görülebilir. Bunlar performans iyileştirmesi olarak sonraki adımda temizlenebilir.
