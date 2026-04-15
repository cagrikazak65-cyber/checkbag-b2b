"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

type CustomerForm = {
  id: number;
  company: string;
  contactName: string;
  phone: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  username: string;
  password: string;
  status: "Aktif" | "Pasif";
};

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("customers");
    if (!stored) return;

    const customers: Customer[] = JSON.parse(stored);
    const found = customers.find((c) => String(c.id) === String(params.id));

    if (!found) return;

    setForm({
      id: found.id,
      company: found.company,
      contactName: found.contactName,
      phone: found.phone,
      address: found.address,
      taxOffice: found.taxOffice,
      taxNumber: found.taxNumber,
      username: found.username,
      password: found.password,
      status: found.status,
    });
  }, [params.id]);

  const handleSave = () => {
    if (!form) return;

    if (
      !form.company ||
      !form.contactName ||
      !form.phone ||
      !form.address ||
      !form.taxOffice ||
      !form.taxNumber ||
      !form.username ||
      !form.password
    ) {
      alert("Lutfen tum alanlari doldurun.");
      return;
    }

    const stored = localStorage.getItem("customers");
    if (!stored) return;

    const customers: Customer[] = JSON.parse(stored);

    const usernameConflict = customers.some(
      (customer) =>
        customer.username === form.username && customer.id !== form.id
    );

    if (usernameConflict) {
      alert("Bu kullanici adi zaten kullaniliyor.");
      return;
    }

    const updatedCustomers = customers.map((customer) =>
      customer.id === form.id
        ? {
            ...customer,
            company: form.company,
            contactName: form.contactName,
            phone: form.phone,
            address: form.address,
            taxOffice: form.taxOffice,
            taxNumber: form.taxNumber,
            username: form.username,
            password: form.password,
            status: form.status,
          }
        : customer
    );

    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    alert("Musteri guncellendi.");
    router.push("/admin/customers");
  };

  if (!form) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-100 p-6">Yukleniyor...</main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Musteri Duzenle</h1>

          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Firma Adi"
              className="w-full rounded-lg border px-4 py-2"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />

            <input
              type="text"
              placeholder="Yetkili Kisi"
              className="w-full rounded-lg border px-4 py-2"
              value={form.contactName}
              onChange={(e) =>
                setForm({ ...form, contactName: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Telefon"
              className="w-full rounded-lg border px-4 py-2"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <textarea
              placeholder="Adres"
              rows={4}
              className="w-full rounded-lg border px-4 py-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
              type="text"
              placeholder="Vergi Dairesi"
              className="w-full rounded-lg border px-4 py-2"
              value={form.taxOffice}
              onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
            />

            <input
              type="text"
              placeholder="Vergi Numarasi"
              className="w-full rounded-lg border px-4 py-2"
              value={form.taxNumber}
              onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
            />

            <input
              type="text"
              placeholder="Kullanici Adi"
              className="w-full rounded-lg border px-4 py-2"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <input
              type="text"
              placeholder="Sifre"
              className="w-full rounded-lg border px-4 py-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <select
              className="w-full rounded-lg border px-4 py-2"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "Aktif" | "Pasif",
                })
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>

            <button
              onClick={handleSave}
              className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
            >
              Guncelle
            </button>
          </div>
        </div>
      </main>
    </>
  );
}