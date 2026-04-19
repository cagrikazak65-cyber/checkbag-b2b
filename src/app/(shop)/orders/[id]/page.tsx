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
  paymentMethod?: string;
  note?: string;
};

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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const loadOrder = async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setOrder(data.order ?? null);
      setIsLoading(false);
    };

    void loadOrder();
  }, [orderId, router]);

  return (
    <>
      <Navbar />

      <main className="page-shell print:bg-white print:p-0">
        <div className="page-container print:max-w-none">
          <div className="page-header print:hidden">
            <div>
              <h1 className="page-title">Sipariş Detayı</h1>
              <p className="page-subtitle">
                Sipariş no: {orderId ? `#${orderId}` : "-"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/orders")}
                className="btn-secondary"
              >
                Siparişlere Dön
              </button>
              <button onClick={() => window.print()} className="btn-primary">
                Yazdır
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">Sipariş yükleniyor...</div>
          ) : !order ? (
            <div className="empty-state">Sipariş bulunamadı.</div>
          ) : (
            <div className="surface-card p-6 print:shadow-none">
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    #{order.id} - {order.createdAt}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Firma:{" "}
                    <span className="font-medium text-gray-900">
                      {order.company}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Ödeme Yöntemi:{" "}
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod || "Belirtilmedi"}
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

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Sipariş Notu
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {order.note?.trim()
                      ? order.note
                      : "Bu sipariş için not girilmemiş."}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Genel Toplam</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {order.totalAmountDisplay || formatMoney(order.totalAmount)} TL
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
