"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("customers");
    const parsed = stored ? JSON.parse(stored) : [];
    setCustomers(parsed);
  }, []);

  const handleDelete = (id: number) => {
    const ok = confirm("Bu musteriyi silmek istiyor musun?");
    if (!ok) return;

    const updated = customers.filter((customer) => customer.id !== id);
    setCustomers(updated);
    localStorage.setItem("customers", JSON.stringify(updated));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Musteri Yonetimi</h1>
              <p className="mt-2 text-sm text-gray-600">
                Musterileri buradan ekleyebilir ve duzenleyebilirsin.
              </p>
            </div>

            <Link
              href="/admin/customers/new"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Yeni Musteri Ekle
            </Link>
          </div>

          {customers.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Henuz musteri eklenmemis.
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="grid flex-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-gray-500">Firma</p>
                        <p className="font-semibold">{customer.company}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Yetkili Kisi
                        </p>
                        <p>{customer.contactName}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">Telefon</p>
                        <p>{customer.phone}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Kullanici Adi
                        </p>
                        <p>{customer.username}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">Sifre</p>
                        <p>{customer.password}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Vergi Dairesi
                        </p>
                        <p>{customer.taxOffice}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Vergi Numarasi
                        </p>
                        <p>{customer.taxNumber}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">Durum</p>
                        <span
                          className={
                            "inline-block rounded-full px-3 py-1 text-xs font-medium " +
                            (customer.status === "Aktif"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700")
                          }
                        >
                          {customer.status}
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-xs uppercase text-gray-500">Adres</p>
                        <p>{customer.address}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={"/admin/customers/edit/" + customer.id}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Duzenle
                      </Link>

                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="rounded bg-red-500 px-3 py-2 text-sm text-white"
                      >
                        Sil
                      </button>
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