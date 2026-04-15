"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: number;
  company: string;
  contactName?: string;
  phone?: string;
  address?: string;
  taxOffice?: string;
  taxNumber?: string;
  username: string;
  password: string;
  role: "customer";
  status: "Aktif" | "Pasif";
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Admin girişi
    if (trimmedUsername === "admin" && trimmedPassword === "14531453") {
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          username: "admin",
          company: "Check Bag",
          role: "admin",
        })
      );

      alert("Admin girişi başarılı.");
      router.push("/admin");
      return;
    }

    // Müşteri kontrolü
    const storedCustomers = localStorage.getItem("customers");
    const customers: Customer[] = storedCustomers
      ? JSON.parse(storedCustomers)
      : [];

    const foundCustomer = customers.find(
      (customer) =>
        customer.username === trimmedUsername &&
        customer.password === trimmedPassword
    );

    if (!foundCustomer) {
      alert("Kullanıcı adı veya şifre yanlış.");
      return;
    }

    if (foundCustomer.status !== "Aktif") {
      alert("Bu hesap pasif durumda. Lütfen yönetici ile iletişime geçin.");
      return;
    }

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        username: foundCustomer.username,
        company: foundCustomer.company,
        role: "customer",
      })
    );

    alert("Giriş başarılı.");
    router.push("/products");
  };

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold">Giriş Yap</h1>
          <p className="mb-6 text-sm text-gray-600">
            Yetkili müşteri hesabı ile giriş yapabilirsiniz.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Şifre</label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full rounded-lg bg-black px-4 py-3 text-white"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </main>
    </>
  );
}