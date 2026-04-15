"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CustomerForm = {
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

export default function NewCustomerPage() {
  const router = useRouter();

  const [form, setForm] = useState<CustomerForm>({
    company: "",
    contactName: "",
    phone: "",
    address: "",
    taxOffice: "",
    taxNumber: "",
    username: "",
    password: "",
    status: "Aktif",
  });

  const handleSave = () => {
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
    const customers = stored ? JSON.parse(stored) : [];

    const usernameExists = customers.some(
      (customer: any) => customer.username === form.username
    );

    if (usernameExists) {
      alert("Bu kullanici adi zaten kullaniliyor.");
      return;
    }

    const newCustomer = {
      id: Date.now(),
      company: form.company,
      contactName: form.contactName,
      phone: form.phone,
      address: form.address,
      taxOffice: form.taxOffice,
      taxNumber: form.taxNumber,
      username: form.username,
      password: form.password,
      role: "customer",
      status: form.status,
    };

    customers.push(newCustomer);
    localStorage.setItem("customers", JSON.stringify(customers));

    alert("Musteri eklendi.");
    router.push("/admin/customers");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Yeni Musteri Ekle</h1>

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
              Kaydet
            </button>
          </div>
        </div>
      </main>
    </>
  );
}