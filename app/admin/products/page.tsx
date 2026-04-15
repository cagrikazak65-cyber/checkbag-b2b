"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  description?: string;
  image?: string;
  status: "Aktif" | "Pasif";
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("adminProducts");
    const parsed = stored ? JSON.parse(stored) : [];
    setProducts(parsed);
  }, []);

  const handleDelete = (id: number) => {
    const confirmDelete = confirm("Bu urunu silmek istiyor musun?");
    if (!confirmDelete) return;

    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("adminProducts", JSON.stringify(updated));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Urun Yonetimi</h1>
              <p className="mt-2 text-sm text-gray-600">
                Urunleri buradan yonetebilirsin.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Yeni Urun Ekle
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Henuz urun yok.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-md"
                >
                  <div className="aspect-[3/4] w-full bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Gorsel yok
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex justify-between">
                      <span className="text-xs text-gray-500 uppercase">
                        {product.category}
                      </span>

                      <span
                        className={
                          "text-xs px-2 py-1 rounded-full " +
                          (product.status === "Aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700")
                        }
                      >
                        {product.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold">{product.name}</h2>

                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {product.description || "Aciklama yok"}
                    </p>

                    <div className="mt-3 text-sm space-y-1">
                      <p>
                        <b>Fiyat:</b> {product.price}
                      </p>

                      <p>
                        <b>Stok:</b>{" "}
                        {product.stockType === "ask"
                          ? "Sorunuz"
                          : product.stockQuantity}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={"/admin/products/edit/" + product.id}
                        className="flex-1 text-center rounded border px-3 py-2 text-sm"
                      >
                        Duzenle
                      </Link>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 rounded bg-red-500 px-3 py-2 text-sm text-white"
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