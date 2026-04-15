"use client";

import Navbar from "@/client/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  category?: string;
  price?: string;
  priceCents?: number;
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

const ORDER_STATUSES: Order["status"][] = [
  "Beklemede",
  "Onaylandi",
  "Reddedildi",
  "Sevk Edildi",
  "Teslim Edildi",
];

function getStatusStyle(status: Order["status"]) {
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

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadOrder = async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setOrder(data.order ?? null);
      setIsLoading(false);
    };

    void loadOrder();
  }, [orderId]);

  const updateStatus = async (status: Order["status"]) => {
    if (!order) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Sipariş durumu güncellenemedi.");
        return;
      }

      setOrder(data.order ?? null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sipariş Detayı</h1>
              <p className="mt-2 text-sm text-gray-600">
                Sipariş no: {orderId ? `#${orderId}` : "-"}
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/orders")}
              className="btn-secondary w-fit"
            >
              Siparişlere Dön
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Sipariş yükleniyor...
            </div>
          ) : !order ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Sipariş bulunamadı.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      #{order.id} - {order.company}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tarih: {order.createdAt}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ödeme Yöntemi:{" "}
                      <span className="font-medium text-gray-900">
                        {order.paymentMethod}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                        <th className="px-3 py-3 font-medium">Ürün</th>
                        <th className="px-3 py-3 font-medium">Kategori</th>
                        <th className="px-3 py-3 font-medium">Adet</th>
                        <th className="px-3 py-3 font-medium">Birim Fiyat</th>
                        <th className="px-3 py-3 font-medium">Satır Toplamı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          className="border-b border-gray-100 text-sm text-gray-700"
                        >
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-3 py-3">{item.category || "-"}</td>
                          <td className="px-3 py-3">{item.quantity}</td>
                          <td className="px-3 py-3">{item.price || "-"}</td>
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {item.priceCents
                              ? `${formatMoney(item.priceCents * item.quantity)} TL`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Sipariş Notu
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {order.note?.trim()
                      ? order.note
                      : "Bu sipariş için not girilmemiş."}
                  </p>
                </div>
              </div>

              <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-600">Genel Toplam</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {order.totalAmountDisplay || formatMoney(order.totalAmount)} TL
                </p>

                <div className="mt-6">
                  <label className="field-label">Sipariş Durumu</label>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      void updateStatus(event.target.value as Order["status"])
                    }
                    disabled={isUpdating}
                    className="field-input"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    onClick={() => updateStatus("Onaylandi")}
                    disabled={isUpdating}
                    className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => updateStatus("Sevk Edildi")}
                    disabled={isUpdating}
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    Sevk Et
                  </button>
                  <button
                    onClick={() => updateStatus("Teslim Edildi")}
                    disabled={isUpdating}
                    className="rounded bg-gray-800 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    Teslim Et
                  </button>
                  <button
                    onClick={() => updateStatus("Reddedildi")}
                    disabled={isUpdating}
                    className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    Reddet
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
