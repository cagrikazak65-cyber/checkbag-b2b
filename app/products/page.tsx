"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
      alert("Bu sayfayı görmek için giriş yapmalısınız.");
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setCompanyName(user.company);
  }, [router]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Ürünler</h1>
          <p className="text-sm text-gray-600">
            Hoş geldiniz, {companyName}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold">Okul Çantası</h2>
            <p className="text-sm text-gray-500">Ürün bilgisi</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold">Kalem Kutusu</h2>
            <p className="text-sm text-gray-500">Ürün bilgisi</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold">Beslenme Çantası</h2>
            <p className="text-sm text-gray-500">Ürün bilgisi</p>
          </div>
        </div>
      </main>
    </>
  );
}