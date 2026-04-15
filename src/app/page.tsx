import Link from "next/link";
import Image from "next/image";
import Navbar from "@/client/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100">
        <section className="border-b bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                Kapalı Devre B2B Toptan Satış Platformu
              </div>

              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                CHECK BAG
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
                Check Bag; perakende ve toptan kırtasiyecilik alanında, toptan
                çanta imalatı, üretimi ve satışı yapan; iş ortaklarına
                avantajlı fiyatlar, alternatif ürünler ve güvenilir tedarik
                sunan profesyonel bir B2B tedarik platformudur.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">
                Bu sistem dışarıya kapalı olarak çalışmaktadır. Ürünleri
                inceleyebilirsiniz; ancak fiyat, stok, sepet ve sipariş
                işlemleri yalnızca yönetici tarafından tanımlanmış yetkili
                müşteri hesapları ile kullanılabilir.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary">
                  Ürünleri Gör
                </Link>

                <Link href="/login" className="btn-secondary">
                  Giriş Yap
                </Link>
              </div>
            </div>

            <div className="surface-card p-8">
              <div className="relative mx-auto flex aspect-[4/5] max-w-sm items-center justify-center overflow-hidden rounded-2xl border bg-white p-6">
                <Image
                  src="/logo.png"
                  alt="Check Bag Logo"
                  fill
                  sizes="(min-width: 1024px) 384px, 80vw"
                  className="object-contain p-6"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="surface-card surface-card-body">
              <h2 className="text-xl font-semibold text-gray-900">
                Güvenilir Tedarik
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Check Bag, sürekli ürün akışı ve güvenilir tedarik anlayışıyla
                iş ortaklarının satış sürecini destekler.
              </p>
            </div>

            <div className="surface-card surface-card-body">
              <h2 className="text-xl font-semibold text-gray-900">
                Avantajlı Fiyatlar
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                B2B odaklı yapısı sayesinde toptan alım süreçlerinde rekabetçi
                fiyatlar ve düzenli iş akışı sunar.
              </p>
            </div>

            <div className="surface-card surface-card-body">
              <h2 className="text-xl font-semibold text-gray-900">
                Yetkili Hesap Sistemi
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Ürün fiyatları, stoklar ve sipariş işlemleri yalnızca yönetici
                tarafından tanımlanmış müşteri hesaplarına açıktır.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-14">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card surface-card-body">
              <h2 className="text-2xl font-semibold text-gray-900">
                Sistem Nasıl Çalışır?
              </h2>

              <div className="mt-5 space-y-4 text-sm text-gray-600">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">1. Yetkili Hesap</p>
                  <p className="mt-1">
                    Yönetici tarafından müşteriye firma bazlı kullanıcı adı ve
                    şifre tanımlanır.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">2. Ürün İnceleme</p>
                  <p className="mt-1">
                    Müşteri aktif ürünleri, stok durumlarını ve fiyatlarını
                    görerek siparişini hazırlar.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">3. Sipariş ve Onay</p>
                  <p className="mt-1">
                    Sepet ve sipariş oluşturulur, admin panelinden sipariş
                    onaylanır ve sevk süreci takip edilir.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-card surface-card-body">
              <h2 className="text-2xl font-semibold text-gray-900">İletişim</h2>

              <div className="mt-5 space-y-4 text-sm text-gray-600">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">Telefon</p>
                  <p className="mt-1">0541 237 5938</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">Konum</p>
                  <p className="mt-1">Van / Türkiye</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">Not</p>
                  <p className="mt-1">
                    Giriş yapmadan sipariş işlemi yapılamaz. Sistem yalnızca
                    yetkili B2B müşteriler için tasarlanmıştır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
