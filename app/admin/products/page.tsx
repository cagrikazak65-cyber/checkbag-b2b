"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: string;
  status: string;
  description?: string;
  image?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem("adminProducts");

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      const defaultProducts: Product[] = [
        {
          id: 1,
          name: "Okul Cantasi",
          category: "Okul Cantaları",
          price: "350 TL",
          stock: "25",
          status: "Aktif",
          description: "Dayanikli okul cantasi",
          image: ""
        },
        {
          id: 2,
          name: "Kalem Kutusu",
          category: "Kalem Kutulari",
          price: "120 TL",
          stock: "Sorunuz",
          status: "Aktif",
          description: "Sik kalem kutusu",
          image: ""
        },
        {
          id: 3,
          name: "Beslenme Cantasi",
          category: "Beslenme Cantaları",
          price: "180 TL",
          stock: "14",
          status: "Pasif",
          description: "Kullanisli beslenme cantasi",
          image: ""
        }
      ];

      localStorage.setItem("adminProducts", JSON.stringify(defaultProducts));
      setProducts(defaultProducts);
    }
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Urun Yonetimi</h1>
              <p className="mt-2 text-sm text-gray-600">
                Sistemdeki urunleri buradan yonetebilirsiniz.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Yeni Urun Ekle
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Urun Adi
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Fiyat
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Islem
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3 text-sm">{product.name}</td>
                    <td className="px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3 text-sm">{product.price}</td>
                    <td className="px-4 py-3 text-sm">{product.stock}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          "rounded-full px-3 py-1 text-xs font-medium " +
                          (product.status === "Aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700")
                        }
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={"/admin/products/edit/" + product.id}
                        className="rounded border px-3 py-1"
                      >
                        Duzenle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}