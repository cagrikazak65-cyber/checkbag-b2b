"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/client/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceCents: number;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  description?: string;
  image?: string;
  status: "Aktif" | "Pasif";
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tümü" | Product["status"]>(
    "Tümü"
  );

  useEffect(() => {
    const loadProducts = async () => {
      const response = await fetch("/api/admin/products", { cache: "no-store" });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setProducts(data.products ?? []);
      setIsLoading(false);
    };

    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return products.filter((product) => {
      const matchesStatus =
        statusFilter === "Tümü" || product.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [product.name, product.category, product.description ?? ""]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [products, search, statusFilter]);

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Bu ürünü silmek istiyor musun?");
    if (!confirmDelete) return;

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Ürün silinemedi.");
      return;
    }

    setProducts((current) => current.filter((p) => p.id !== id));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
              <p className="mt-2 text-sm text-gray-600">
                Ürünleri buradan yönetebilirsin.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Yeni Ürün Ekle
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Ürünler yükleniyor...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Henüz ürün yok.
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
                <div>
                  <label className="field-label">Ürün ara</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="field-input"
                    placeholder="Ürün adı, kategori veya açıklama"
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

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  Filtrelere uygun ürün bulunamadı.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-md"
                    >
                      <div className="relative aspect-[3/4] w-full bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            Görsel yok
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

                        <h2 className="text-lg font-semibold">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {product.description || "Açıklama yok"}
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
                            Düzenle
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
