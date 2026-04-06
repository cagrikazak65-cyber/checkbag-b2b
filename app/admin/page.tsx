"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Paneli</h1>
            <p className="mt-2 text-sm text-gray-600">
              Check Bag yönetim ekranına hoş geldiniz.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500">Toplam Ürün</h2>
              <p className="mt-3 text-3xl font-bold">24</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500">Toplam Müşteri</h2>
              <p className="mt-3 text-3xl font-bold">8</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500">Bekleyen Sipariş</h2>
              <p className="mt-3 text-3xl font-bold">3</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Hızlı İşlemler</h2>
              <div className="flex flex-wrap gap-3">
<Link
  href="/admin/products"
  className="rounded-lg bg-black px-4 py-2 text-white"
>
  Ürünleri Yönet
</Link>
                <button className="rounded-lg border px-4 py-2">
                  Müşterileri Gör
                </button>
                <button className="rounded-lg border px-4 py-2">
                  Siparişleri Gör
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Son Durum</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 2 yeni müşteri hesabı eklendi</li>
                <li>• 3 sipariş yönetici onayı bekliyor</li>
                <li>• 1 ürün stok güncellemesi gerekiyor</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}