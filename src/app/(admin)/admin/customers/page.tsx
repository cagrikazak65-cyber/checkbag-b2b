"use client";

import Link from "next/link";
import Navbar from "@/client/components/Navbar";
import { useEffect, useMemo, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tümü" | Customer["status"]>(
    "Tümü"
  );

  useEffect(() => {
    const loadCustomers = async () => {
      const response = await fetch("/api/admin/customers", { cache: "no-store" });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setCustomers(data.customers ?? []);
      setIsLoading(false);
    };

    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return customers.filter((customer) => {
      const matchesStatus =
        statusFilter === "Tümü" || customer.status === statusFilter;
      const searchableText = [
        customer.company,
        customer.contactName,
        customer.phone,
        customer.address,
        customer.taxOffice,
        customer.taxNumber,
        customer.username,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return (
        matchesStatus &&
        (normalizedSearch.length === 0 ||
          searchableText.includes(normalizedSearch))
      );
    });
  }, [customers, search, statusFilter]);

  const handleDelete = async (id: number) => {
    const ok = confirm("Bu müşteriyi silmek istiyor musun?");
    if (!ok) return;

    const response = await fetch(`/api/admin/customers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Müşteri silinemedi.");
      return;
    }

    setCustomers((current) => current.filter((customer) => customer.id !== id));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Müşteri Yönetimi</h1>
              <p className="mt-2 text-sm text-gray-600">
                Müşterileri buradan ekleyebilir ve düzenleyebilirsin.
              </p>
            </div>

            <Link
              href="/admin/customers/new"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Yeni Müşteri Ekle
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Müşteriler yükleniyor...
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Henüz müşteri eklenmemiş.
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
                <div>
                  <label className="field-label">Müşteri ara</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="field-input"
                    placeholder="Firma, yetkili, telefon, vergi no veya kullanıcı adı"
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
                    <option value="Tümü">Tümü</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  Filtrelere uygun müşteri bulunamadı.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="rounded-2xl bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid flex-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Firma
                            </p>
                            <p className="font-semibold">{customer.company}</p>
                          </div>

                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Yetkili Kişi
                            </p>
                            <p>{customer.contactName}</p>
                          </div>

                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Telefon
                            </p>
                            <p>{customer.phone}</p>
                          </div>

                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Kullanıcı Adı
                            </p>
                            <p>{customer.username}</p>
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
                            <p className="text-xs uppercase text-gray-500">
                              Durum
                            </p>
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
                            <p className="text-xs uppercase text-gray-500">
                              Adres
                            </p>
                            <p>{customer.address}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={"/admin/customers/edit/" + customer.id}
                            className="rounded border px-3 py-2 text-sm"
                          >
                            Düzenle
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
