"use client";

import Navbar from "@/client/components/Navbar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
};

type Order = {
  id: number;
  company: string;
  items: OrderItem[];
  status: "Beklemede" | "Onaylandi" | "Reddedildi" | "Sevk Edildi" | "Teslim Edildi";
  createdAt: string;
  totalAmount: number;
  totalAmountDisplay?: string;
  paymentMethod: string;
  note: string;
};

const ORDER_STATUSES: Array<"Tümü" | Order["status"]> = [
  "Tümü",
  "Beklemede",
  "Onaylandi",
  "Reddedildi",
  "Sevk Edildi",
  "Teslim Edildi",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tümü" | Order["status"]>(
    "Tümü"
  );

  useEffect(() => {
    const loadOrders = async () => {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setOrders(data.orders ?? []);
      setIsLoading(false);
    };

    void loadOrders();
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.id - a.id);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return sortedOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "Tümü" || order.status === statusFilter;
      const searchableText = [
        order.id.toString(),
        order.company,
        order.paymentMethod,
        order.note,
        ...order.items.map((item) => item.name),
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return (
        matchesStatus &&
        (normalizedSearch.length === 0 ||
          searchableText.includes(normalizedSearch))
      );
    });
  }, [search, sortedOrders, statusFilter]);

  const updateStatus = async (orderId: number, newStatus: Order["status"]) => {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Sipariş durumu güncellenemedi.");
      return;
    }

    setOrders(data.orders ?? []);
  };

  const getStatusStyle = (status: Order["status"]) => {
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
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Siparişler</h1>
            <p className="mt-2 text-sm text-gray-600">
              En yeni siparişler en üstte listelenir.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Siparişler yükleniyor...
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Henüz sipariş yok.
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
                <div>
                  <label className="field-label">Sipariş ara</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="field-input"
                    placeholder="Firma, ürün, not veya sipariş no"
                  />
                </div>

                <div>
                  <label className="field-label">Durum</label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as typeof statusFilter)
                    }
                    className="field-input"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  Filtrelere uygun sipariş bulunamadı.
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Sipariş No: <b>#{order.id}</b>
                      </p>
                      <p>
                        Firma: <b>{order.company}</b>
                      </p>
                      <p>Tarih: {order.createdAt}</p>
                      <p>
                        Ödeme Yöntemi: <b>{order.paymentMethod}</b>
                      </p>
                    </div>

                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h2 className="mb-2 font-semibold">Ürünler</h2>

                    {order.items.map((item, i) => (
                      <div key={i} className="mb-2 text-sm text-gray-700">
                        {item.name} - {item.quantity} adet
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                    <p className="font-medium">Sipariş Notu</p>
                    <p className="mt-1 text-gray-600">{order.note}</p>
                  </div>

                  <div className="mt-4 font-semibold">
                    Toplam:{" "}
                    {order.totalAmountDisplay ||
                      `${order.totalAmount / 100} TL`}
                  </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Detay
                        </Link>

                        <button
                          onClick={() => updateStatus(order.id, "Onaylandi")}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                    >
                      Onayla
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "Reddedildi")}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      Reddet
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "Sevk Edildi")}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                    >
                      Sevk Et
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "Teslim Edildi")}
                      className="rounded bg-gray-800 px-3 py-1 text-sm text-white"
                    >
                      Teslim Et
                    </button>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
