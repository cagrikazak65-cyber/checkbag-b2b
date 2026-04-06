"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const storedProducts = localStorage.getItem("adminProducts");
    if (!storedProducts) return;

    const products: Product[] = JSON.parse(storedProducts);
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setStatus(product.status);
    setDescription(product.description || "");
    setImage(product.image || "");
  }, [productId]);

  const handleUpdate = () => {
    const storedProducts = localStorage.getItem("adminProducts");
    if (!storedProducts) return;

    const products: Product[] = JSON.parse(storedProducts);

    const updatedProducts = products.map((product) =>
      product.id === productId
        ? {
            ...product,
            name,
            category,
            price,
            stock,
            status,
            description,
            image,
          }
        : product
    );

    localStorage.setItem("adminProducts", JSON.stringify(updatedProducts));
    alert("Ürün güncellendi.");
    router.push("/admin/products");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Ürünü Düzenle</h1>

          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Ürün Adı</label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Fiyat</label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Stok</label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Ürün Açıklaması
              </label>
              <textarea
                className="w-full rounded-lg border px-4 py-2"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Görsel Linki
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Durum</label>
              <select
                className="w-full rounded-lg border px-4 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
              </select>
            </div>

            <button
              onClick={handleUpdate}
              className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
            >
              Güncelle
            </button>
          </div>
        </div>
      </main>
    </>
  );
}