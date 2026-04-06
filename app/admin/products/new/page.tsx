"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stockType, setStockType] = useState("quantity");
  const [stockQuantity, setStockQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("Aktif");

  const handleSave = () => {
    if (!name || !category || !price || !description || !image) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }

    if (stockType === "quantity" && !stockQuantity) {
      alert("Stok adedi girilmelidir.");
      return;
    }

    const existingProducts = localStorage.getItem("adminProducts");
    const products = existingProducts ? JSON.parse(existingProducts) : [];

    const newProduct = {
      id: Date.now(),
      name,
      category,
      price,
      stock: stockType === "ask" ? "Sorunuz" : stockQuantity,
      stockType,
      description,
      image,
      status,
    };

    products.push(newProduct);
    localStorage.setItem("adminProducts", JSON.stringify(products));

    alert("Ürün başarıyla eklendi.");
    router.push("/admin/products");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Yeni Ürün Ekle</h1>

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
                placeholder="Örn: 350 ₺"
                className="w-full rounded-lg border px-4 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Stok Tipi</label>
              <select
                className="w-full rounded-lg border px-4 py-2"
                value={stockType}
                onChange={(e) => setStockType(e.target.value)}
              >
                <option value="quantity">Adetli Stok</option>
                <option value="ask">Sorunuz</option>
              </select>
            </div>

            {stockType === "quantity" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Stok Adedi
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-4 py-2"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            )}

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
                placeholder="https://..."
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
              onClick={handleSave}
              className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
            >
              Ürünü Kaydet
            </button>
          </div>
        </div>
      </main>
    </>
  );
}