"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

type ProductForm = {
  id: number;
  name: string;
  category: string;
  price: string;
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

  useEffect(() => {
    const stored = localStorage.getItem("adminProducts");
    if (!stored) return;

    const products: Product[] = JSON.parse(stored);
    const found = products.find((p) => String(p.id) === String(params.id));

    if (!found) return;

    setForm({
      id: found.id,
      name: found.name,
      category: found.category,
      price: found.price,
      stockType: found.stockType,
      stockQuantity:
        found.stockQuantity !== null ? String(found.stockQuantity) : "",
      description: found.description || "",
      image: found.image || "",
      status: found.status,
    });
  }, [params.id]);

  const handleSave = () => {
    if (!form) return;

    const stored = localStorage.getItem("adminProducts");
    if (!stored) return;

    const products: Product[] = JSON.parse(stored);

    const updatedProducts = products.map((product) =>
      product.id === form.id
        ? {
            ...product,
            name: form.name,
            category: form.category,
            price: form.price,
            stockType: form.stockType,
            stockQuantity:
              form.stockType === "quantity"
                ? Number(form.stockQuantity)
                : null,
            description: form.description,
            image: form.image,
            status: form.status,
          }
        : product
    );

    localStorage.setItem("adminProducts", JSON.stringify(updatedProducts));
    alert("Urun guncellendi.");
    router.push("/admin/products");
  };

  if (!form) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-100 p-6">Yukleniyor...</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold">Urun Duzenle</h1>

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

                const reader = new FileReader();
                reader.onload = () => {
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          image: reader.result as string,
                        }
                      : prev
                  );
                };
                reader.readAsDataURL(file);
              }}
              className="w-full rounded-lg border px-4 py-2"
            />

            {form.image && (
              <img
                src={form.image}
                alt="Onizleme"
                className="h-40 w-40 rounded-lg border object-cover"
              />
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
              Guncelle
            </button>
          </div>
        </div>
      </main>
    </>
  );
}