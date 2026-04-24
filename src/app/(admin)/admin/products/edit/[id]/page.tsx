"use client";

import Navbar from "@/client/components/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceCents: number;
  vatRate: number;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  description?: string;
  image?: string;
  status: "Aktif" | "Pasif";
};

type ProductForm = {
  id: number;
  name: string;
  category: string;
  price: string;
  vatRate: string;
  stockType: "quantity" | "ask";
  stockQuantity: string;
  description: string;
  image: string;
  status: "Aktif" | "Pasif";
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<ProductForm | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const found: Product = data.product;

      setForm({
        id: found.id,
        name: found.name,
        category: found.category,
        price: found.price,
        vatRate: String(found.vatRate),
        stockType: found.stockType,
        stockQuantity:
          found.stockQuantity !== null ? String(found.stockQuantity) : "",
        description: found.description || "",
        image: found.image || "",
        status: found.status,
      });
    };

    void loadProduct();
  }, [params.id]);

  const handleSave = async () => {
    if (!form) return;

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

    const stockQuantity = Number(trimmedForm.stockQuantity);
    const vatRate = Number(trimmedForm.vatRate);

    if (
      trimmedForm.stockType === "quantity" &&
      (!trimmedForm.stockQuantity ||
        !Number.isInteger(stockQuantity) ||
        stockQuantity < 0)
    ) {
      alert("Stok adedi 0 veya daha büyük bir tam sayı olmalıdır.");
      return;
    }

    if (!Number.isInteger(vatRate) || vatRate < 0 || vatRate > 100) {
      alert("KDV oranı 0 ile 100 arasında bir tam sayı olmalıdır.");
      return;
    }

    const response = await fetch(`/api/admin/products/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trimmedForm),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Ürün güncellenemedi.");
      return;
    }

    alert("Ürün güncellendi.");
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

      setForm((current) => (current ? { ...current, image: data.url } : current));
    } finally {
      setIsUploading(false);
    }
  };

  if (!form) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-100 p-6">Yükleniyor...</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Ürün Düzenle</h1>

          <div className="grid gap-4">
            <input
              type="text"
              className="w-full rounded-lg border px-4 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="text"
              className="w-full rounded-lg border px-4 py-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              type="text"
              className="w-full rounded-lg border px-4 py-2"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              type="number"
              min="0"
              max="100"
              className="w-full rounded-lg border px-4 py-2"
              value={form.vatRate}
              onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
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
                className="w-full rounded-lg border px-4 py-2"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              />
            )}

            <textarea
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
              Güncelle
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
