"use client";

import Navbar from "@/client/components/Navbar";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductForm = {
  name: string;
  category: string;
  price: string;
  stockType: "quantity" | "ask";
  stockQuantity: string;
  description: string;
  image: string;
  status: "Aktif" | "Pasif";
};

export default function NewProductPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    category: "",
    price: "",
    stockType: "quantity",
    stockQuantity: "",
    description: "",
    image: "",
    status: "Aktif",
  });

  const handleSave = async () => {
    const trimmedForm = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      price: form.price.trim(),
      description: form.description.trim(),
      stockQuantity: form.stockQuantity.trim(),
    };

    if (!trimmedForm.name || !trimmedForm.category || !trimmedForm.price || !trimmedForm.description) {
      alert("Lütfen gerekli alanları doldurun.");
      return;
    }

    if (trimmedForm.stockType === "quantity" && !trimmedForm.stockQuantity) {
      alert("Stok adedi girmeniz gerekiyor.");
      return;
    }

    const stockQuantity = Number(trimmedForm.stockQuantity);

    if (
      trimmedForm.stockType === "quantity" &&
      (!Number.isInteger(stockQuantity) || stockQuantity < 0)
    ) {
      alert("Stok adedi 0 veya daha büyük bir tam sayı olmalıdır.");
      return;
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trimmedForm),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Ürün eklenemedi.");
      return;
    }

    alert("Ürün eklendi.");
    router.push("/admin/products");
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Görsel yüklenemedi.");
        return;
      }

      setForm((current) => ({ ...current, image: data.url }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Yeni Ürün Ekle</h1>

          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Ürün Adı"
              className="w-full rounded-lg border px-4 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Kategori"
              className="w-full rounded-lg border px-4 py-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              type="text"
              placeholder="Fiyat"
              className="w-full rounded-lg border px-4 py-2"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <select
              className="w-full rounded-lg border px-4 py-2"
              value={form.stockType}
              onChange={(e) =>
                setForm({
                  ...form,
                  stockType: e.target.value as "quantity" | "ask",
                  stockQuantity: e.target.value === "ask" ? "" : form.stockQuantity,
                })
              }
            >
              <option value="quantity">Adetli Stok</option>
              <option value="ask">Sorunuz</option>
            </select>

            {form.stockType === "quantity" && (
              <input
                type="number"
                min="0"
                placeholder="Stok Adedi"
                className="w-full rounded-lg border px-4 py-2"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              />
            )}

            <textarea
              placeholder="Açıklama"
              className="w-full rounded-lg border px-4 py-2"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                void handleImageUpload(file);
              }}
              className="w-full rounded-lg border px-4 py-2"
            />

            {isUploading && (
              <p className="text-sm text-gray-500">Görsel yükleniyor...</p>
            )}

            {form.image && (
              <div className="relative h-40 w-40 overflow-hidden rounded-lg border">
                <Image
                  src={form.image}
                  alt="Önizleme"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            )}

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
