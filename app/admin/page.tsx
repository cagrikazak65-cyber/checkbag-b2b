"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  description?: string;
  image?: string;
  status: "Aktif" | "Pasif";
};

type Order = {
  id: number;
  company: string;
  items: any[];
  status: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod?: string;
  note?: string;
};

type Customer = {
  id: number;
  company: string;
  contactName: string;
  phone: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  username: string;
  password: string;
  role: "customer";
  status: "Aktif" | "Pasif";
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem("adminProducts");
    const parsedProducts: Product[] = storedProducts
      ? JSON.parse(storedProducts)
      : [];
    setProducts(parsedProducts);

    const storedOrders = localStorage.getItem("orders");
    const parsedOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    setOrders(parsedOrders);

    const storedCustomers = localStorage.getItem("customers");
    const parsedCustomers: Customer[] = storedCustomers
      ? JSON.parse(storedCustomers)
      : [];
    setCustomers(parsedCustomers);
  }, []);

  const totalProducts = products.length;

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "Aktif").length,
    [products]
  );

  const passiveProducts = useMemo(
    () => products.filter((product) => product.status === "Pasif").length,
    [products]
  );

  const totalOrders = orders.length;

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "Beklemede").length,
    [orders]
  );

  const totalCustomers = customers.length;

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.status === "Aktif").length,
    [customers]
  );

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.id - a.id).slice(0, 5);
  }, [orders]);

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
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Toplam Ürün</p>
              <h2 className="mt-3 text-3xl font-bold">{totalProducts}</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Aktif Ürün</p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">
                {activeProducts}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Pasif Ürün</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-600">
                {passiveProducts}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Toplam Sipariş</p>
              <h2 className="mt-3 text-3xl font-bold">{totalOrders}</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Bekleyen Sipariş</p>
              <h2 className="mt-3 text-3xl font-bold text-orange-600">
                {pendingOrders}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Toplam Müşteri</p>
              <h2 className="mt-3 text-3xl font-bold">{totalCustomers}</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Aktif Müşteri</p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">
                {activeCustomers}
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
              <h2 className="text-xl font-semibold">Son Siparişler</h2>

              {recentOrders.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  Henüz sipariş bulunmuyor.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border p-4 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{order.company}</p>
                          <p className="text-gray-500">{order.createdAt}</p>
                        </div>

                        <span className="rounded bg-black px-3 py-1 text-xs text-white">
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-3 text-gray-700">
                        Toplam: {order.totalAmount} TL
                      </p>

                      <p className="mt-1 text-gray-500">
                        Ürün Çeşidi: {order.items.length}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}