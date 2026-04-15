"use client";

import Link from "next/link";
import Navbar from "@/client/components/Navbar";
import { useEffect, useState } from "react";

type Order = {
  id: number;
  company: string;
  items: { id: number; name: string; quantity: number }[];
  status: string;
  createdAt: string;
  totalAmount: number;
  totalAmountDisplay?: string;
  paymentMethod?: string;
  note?: string;
};

type LowStockProduct = {
  id: number;
  name: string;
  category: string;
  stockQuantity: number | null;
};

type DashboardData = {
  totalProducts: number;
  activeProducts: number;
  passiveProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  activeRevenueCents: number;
  activeRevenueDisplay: string;
  completedRevenueCents: number;
  completedRevenueDisplay: string;
  totalCustomers: number;
  activeCustomers: number;
  lowStockProducts: LowStockProduct[];
  recentOrders: Order[];
};

function getStatusStyle(status: string) {
  switch (status) {
    case "Beklemede":
      return "bg-yellow-100 text-yellow-700";
    case "Onaylandi":
      return "bg-green-100 text-green-700";
    case "Reddedildi":
      return "bg-red-100 text-red-700";
    case "Sevk Edildi":
      return "bg-blue-100 text-blue-700";
    case "Teslim Edildi":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      setDashboard(await response.json());
    };

    void loadDashboard();
  }, []);

  const data =
    dashboard ??
    {
      totalProducts: 0,
      activeProducts: 0,
      passiveProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      rejectedOrders: 0,
      activeRevenueCents: 0,
      activeRevenueDisplay: "0,00",
      completedRevenueCents: 0,
      completedRevenueDisplay: "0,00",
      totalCustomers: 0,
      activeCustomers: 0,
      lowStockProducts: [],
      recentOrders: [],
    };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Paneli</h1>
            <p className="mt-2 text-sm text-gray-600">
              Siparişleri, ürünleri, müşterileri ve genel durumu buradan takip edebilirsin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
              <p className="text-sm text-gray-500">Aktif Sipariş Cirosu</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                {data.activeRevenueDisplay} TL
              </h2>
              <p className="mt-2 text-xs text-gray-500">
                Reddedilen siparişler hariç toplam.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
              <p className="text-sm text-gray-500">Teslim Edilen Ciro</p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">
                {data.completedRevenueDisplay} TL
              </h2>
              <p className="mt-2 text-xs text-gray-500">
                Durumu teslim edilen siparişlerden.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Toplam Ürün</p>
              <h2 className="mt-3 text-3xl font-bold">{data.totalProducts}</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Aktif Ürün</p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">
                {data.activeProducts}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Pasif Ürün</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-600">
                {data.passiveProducts}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Toplam Sipariş</p>
              <h2 className="mt-3 text-3xl font-bold">{data.totalOrders}</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Bekleyen Sipariş</p>
              <h2 className="mt-3 text-3xl font-bold text-orange-600">
                {data.pendingOrders}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Teslim Edilen</p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">
                {data.completedOrders}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Reddedilen</p>
              <h2 className="mt-3 text-3xl font-bold text-red-600">
                {data.rejectedOrders}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Toplam Müşteri</p>
              <h2 className="mt-3 text-3xl font-bold">{data.totalCustomers}</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Aktif Müşteri</p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">
                {data.activeCustomers}
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Hızlı İşlemler</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/admin/products"
                  className="rounded-lg border px-4 py-3 text-center"
                >
                  Ürünleri Yönet
                </Link>

                <Link
                  href="/admin/products/new"
                  className="rounded-lg bg-black px-4 py-3 text-center text-white"
                >
                  Yeni Ürün Ekle
                </Link>

                <Link
                  href="/admin/orders"
                  className="rounded-lg border px-4 py-3 text-center"
                >
                  Siparişleri Gör
                </Link>

                <Link
                  href="/admin/customers"
                  className="rounded-lg border px-4 py-3 text-center"
                >
                  Müşterileri Yönet
                </Link>

                <Link
                  href="/admin/customers/new"
                  className="rounded-lg border px-4 py-3 text-center"
                >
                  Yeni Müşteri Ekle
                </Link>

                <Link
                  href="/products"
                  className="rounded-lg border px-4 py-3 text-center"
                >
                  Müşteri Sayfasına Git
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Son Siparişler</h2>
                <Link href="/admin/orders" className="text-sm font-medium text-gray-700">
                  Tümünü Gör
                </Link>
              </div>

              {data.recentOrders.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  Henüz sipariş bulunmuyor.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {data.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border p-4 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{order.company}</p>
                          <p className="text-gray-500">{order.createdAt}</p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-3 text-gray-700">
                        Toplam: {order.totalAmountDisplay || `${order.totalAmount / 100} TL`}
                      </p>

                      <p className="mt-1 text-gray-500">
                        Ürün Çeşidi: {order.items.length}
                      </p>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mt-3 inline-flex rounded border px-3 py-1 text-xs font-medium"
                      >
                        Detay
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Düşük Stok Ürünler</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Aktif ve stok adedi 10 veya altındaki ürünler.
                </p>
              </div>

              <Link href="/admin/products" className="text-sm font-medium text-gray-700">
                Ürünlere Git
              </Link>
            </div>

            {data.lowStockProducts.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Kritik stokta ürün bulunmuyor.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="px-3 py-3 font-medium">Ürün</th>
                      <th className="px-3 py-3 font-medium">Kategori</th>
                      <th className="px-3 py-3 font-medium">Stok</th>
                      <th className="px-3 py-3 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 text-sm"
                      >
                        <td className="px-3 py-3 font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {product.category}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            {product.stockQuantity ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="rounded border px-3 py-1 text-xs font-medium"
                          >
                            Düzenle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
