"use client";

import Navbar from "@/components/Navbar";
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
  paymentMethod: string;
  note: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders([]);
    }
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.id - a.id);
  }, [orders]);

  const updateStatus = (orderId: number, newStatus: Order["status"]) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
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
            <h1 className="text-3xl font-bold">Siparisler</h1>
            <p className="mt-2 text-sm text-gray-600">
              En yeni siparisler en ustte listelenir.
            </p>
          </div>

          {sortedOrders.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Henuz siparis yok.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Firma: <b>{order.company}</b>
                      </p>
                      <p>Tarih: {order.createdAt}</p>
                      <p>
                        Odeme Yontemi: <b>{order.paymentMethod}</b>
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
                    <h2 className="mb-2 font-semibold">Urunler</h2>

                    {order.items.map((item, i) => (
                      <div key={i} className="mb-2 text-sm text-gray-700">
                        {item.name} - {item.quantity} adet
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                    <p className="font-medium">Siparis Notu</p>
                    <p className="mt-1 text-gray-600">{order.note}</p>
                  </div>

                  <div className="mt-4 font-semibold">
                    Toplam: {order.totalAmount} TL
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
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
        </div>
      </main>
    </>
  );
}