"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: number;
  name: string;
  category?: string;
  price?: string;
  quantity: number;
};

type Order = {
  id: number;
  company: string;
  items: OrderItem[];
  status: "Beklemede" | "Onaylandi" | "Reddedildi" | "Sevk Edildi" | "Teslim Edildi";
  createdAt: string;
  totalAmount: number;
  paymentMethod?: string;
  note?: string;
};

type LoggedInUser = {
  username: string;
  company: string;
  role?: "admin" | "customer";
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user: LoggedInUser = JSON.parse(storedUser);
    setCompanyName(user.company || "");

    const storedOrders = localStorage.getItem("orders");
    const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];

    const myOrders = allOrders.filter(
      (order) => order.company === user.company
    );

    setOrders(myOrders);
  }, [router]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.id - a.id);
  }, [orders]);

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

  const getNumericPrice = (price?: string) => {
    const cleaned = String(price || "").replace(/[^\d]/g, "");
    return Number(cleaned) || 0;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Navbar />

      <main className="page-shell print:bg-white print:p-0">
        <div className="page-container print:max-w-none">
          <div className="page-header print:hidden">
            <div>
              <h1 className="page-title">Siparişlerim</h1>
              <p className="page-subtitle">
                Firma: {companyName || "Müşteri"} — en yeni siparişler en üstte listelenir.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/products")}
                className="btn-secondary"
              >
                Ürünlere Dön
              </button>

              <button onClick={handlePrint} className="btn-primary">
                Yazdır
              </button>
            </div>
          </div>

          {sortedOrders.length === 0 ? (
            <div className="empty-state">Henüz oluşturulmuş bir siparişiniz bulunmuyor.</div>
          ) : (
            <div className="space-y-6">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="surface-card p-6 print:break-inside-avoid print:shadow-none"
                >
                  <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Sipariş Tarihi: {order.createdAt}
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

                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-900">
                      Sipariş İçeriği
                    </h3>

                    <div className="mt-4 overflow-x-auto">
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
                              key={index}
                              className="border-b border-gray-100 text-sm text-gray-700"
                            >
                              <td className="px-3 py-3 font-medium text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-3 py-3">
                                {item.category || "-"}
                              </td>
                              <td className="px-3 py-3">{item.quantity}</td>
                              <td className="px-3 py-3">{item.price || "-"}</td>
                              <td className="px-3 py-3 font-medium text-gray-900">
                                {item.price
                                  ? `${getNumericPrice(item.price) * item.quantity} TL`
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                        {order.totalAmount} TL
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}