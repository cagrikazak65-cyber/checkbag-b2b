import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security";
import { parsePriceCents } from "../src/lib/api/format";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const adminPassword = hashPassword("14531453");
  const customerPassword = hashPassword("123456");

  // Admin kullanıcısı
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminPassword, status: "Aktif" },
    create: {
      username: "admin",
      password: adminPassword,
      role: "admin",
      status: "Aktif",
    },
  });

  console.log("✓ Admin kullanıcısı:", admin.username);

  // Test müşteri
  const user = await prisma.user.upsert({
    where: { username: "musteri1" },
    update: { password: customerPassword, status: "Aktif" },
    create: {
      username: "musteri1",
      password: customerPassword,
      role: "customer",
      status: "Aktif",
      customer: {
        create: {
          company: "XYZ Kırtasiye",
          contactName: "Ahmet Yılmaz",
          phone: "+90 555 123 4567",
          address: "İstanbul, Türkiye",
          taxOffice: "İstanbul Vergi Müdürlüğü",
          taxNumber: "1234567890",
          status: "Aktif",
        },
      },
    },
  });

  console.log("✓ Test müşteri:", user.username);

  // Örnek ürünler
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {
        name: "Çanta A4",
        category: "Çantalar",
        price: "45,50",
        priceCents: parsePriceCents("45,50"),
        stockType: "quantity",
        stockQuantity: 100,
        description: "Kaliteli A4 çanta",
        image: "/logo.png",
        status: "Aktif",
      },
      create: {
        name: "Çanta A4",
        category: "Çantalar",
        price: "45,50",
        priceCents: parsePriceCents("45,50"),
        stockType: "quantity",
        stockQuantity: 100,
        description: "Kaliteli A4 çanta",
        image: "/logo.png",
        status: "Aktif",
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {
        name: "Defter Premium",
        category: "Defterler",
        price: "12,75",
        priceCents: parsePriceCents("12,75"),
        stockType: "quantity",
        stockQuantity: 250,
        description: "Özel defter",
        image: "/logo.png",
        status: "Aktif",
      },
      create: {
        name: "Defter Premium",
        category: "Defterler",
        price: "12,75",
        priceCents: parsePriceCents("12,75"),
        stockType: "quantity",
        stockQuantity: 250,
        description: "Özel defter",
        image: "/logo.png",
        status: "Aktif",
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {
        name: "Kağıt A3",
        category: "Kağıt",
        price: "250,00",
        priceCents: parsePriceCents("250,00"),
        stockType: "ask",
        stockQuantity: null,
        description: "Premium A3 kağıdı - talep üzerine",
        image: "/logo.png",
        status: "Aktif",
      },
      create: {
        name: "Kağıt A3",
        category: "Kağıt",
        price: "250,00",
        priceCents: parsePriceCents("250,00"),
        stockType: "ask",
        stockQuantity: null,
        description: "Premium A3 kağıdı - talep üzerine",
        image: "/logo.png",
        status: "Aktif",
      },
    }),
  ]);

  console.log(`✓ ${products.length} ürün oluşturuldu`);
  console.log("\n✅ Veritabanı başarıyla dolduruldu!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Hata:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
