import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">CHECK BAG</h1>

        <p className="max-w-xl text-lg mb-6">
          Check Bag, perakende ve toptan kırtasiyecilik alanında; toptan çanta
          imalatı, üretimi ve satışı yapan, müşterilerine alternatif ürünler ve
          avantajlı fiyatlar sunan güvenilir bir tedarikçidir.
        </p>

        <p className="text-sm text-gray-600 mb-6">
          Bu platform sadece yetkili müşterilere açıktır.
        </p>

        <div className="flex gap-4">
          <Link
            href="/products"
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Ürünleri Gör
          </Link>

          <Link
            href="/login"
            className="border px-6 py-2 rounded-lg"
          >
            Giriş Yap
          </Link>
        </div>
      </main>
    </>
  );
}