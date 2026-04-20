"use client";

import Navbar from "@/client/components/Navbar";
import ProductImage from "@/client/components/ProductImage";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tümü");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError("");
        const response = await fetch("/api/products", { cache: "no-store" });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Urunler yuklenemedi.");
          return;
        }

        const activeProducts: Product[] = data.products ?? [];
        const initialQuantities: Record<number, number> = {};
        activeProducts.forEach((product) => {
          initialQuantities[product.id] = 1;
        });

        setProducts(activeProducts);
        setQuantities(initialQuantities);
      } catch {
        setError("Urunler yuklenirken bir hata olustu.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, [router]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category))).sort(
      (a, b) => a.localeCompare(b, "tr")
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "Tümü" || product.category === categoryFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [product.name, product.category, product.description ?? ""]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, products, search]);

  const handleQuantityChange = (productId: number, value: string) => {
    if (value === "") {
      setQuantities((prev) => ({
        ...prev,
        [productId]: 1,
      }));
      return;
    }

    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue < 1) {
      return;
    }

    const product = products.find((p) => p.id === productId);

    if (
      product &&
      product.stockType === "quantity" &&
      product.stockQuantity !== null &&
      numericValue > product.stockQuantity
    ) {
      alert("Stoktan fazla adet giremezsiniz.");
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [productId]: numericValue,
    }));
  };

  const handleAddToCart = async (product: Product) => {
    const quantity = quantities[product.id] || 1;

    if (
      product.stockType === "quantity" &&
      product.stockQuantity !== null &&
      product.stockQuantity <= 0
    ) {
      alert("Bu ürün stokta yok, sepete eklenemez.");
      return;
    }

    if (
      product.stockType === "quantity" &&
      product.stockQuantity !== null &&
      quantity > product.stockQuantity
    ) {
      alert("Stoktan fazla ürün ekleyemezsiniz.");
      return;
    }

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Ürün sepete eklenemedi.");
      return;
    }

    alert("Ürün sepete eklendi.");
  };

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Ürünler</h1>
              <p className="page-subtitle">
                Aktif ürünleri buradan inceleyip sepete ekleyebilirsiniz.
              </p>
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="btn-secondary"
            >
              Sepetim
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state">Ürünler yükleniyor...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : products.length === 0 ? (
            <div className="empty-state">Gösterilecek ürün bulunamadı.</div>
          ) : (
            <>
              <div className="surface-card mb-6 grid gap-4 p-4 md:grid-cols-[1fr_220px]">
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
                  <label className="field-label">Kategori</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="field-input"
                  >
                    <option value="Tümü">Tümü</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  Filtrelere uygun ürün bulunamadı.
                </div>
              ) : (
                <div className="panel-grid">
                  {filteredProducts.map((product) => {
                    const isOutOfStock =
                      product.stockType === "quantity" &&
                      product.stockQuantity !== null &&
                      product.stockQuantity <= 0;

                    return (
                      <div key={product.id} className="panel-card">
                        <div className="panel-card-image relative">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>

                        <div className="panel-card-content">
                          <p className="panel-card-meta">{product.category}</p>

                          <h2 className="panel-card-title">{product.name}</h2>

                          <p className="panel-card-text">
                            {product.description || "Açıklama yok"}
                          </p>

                          <div className="mt-3 space-y-1">
                            <p className="text-base font-semibold text-gray-900">
                              Fiyat: {product.price}
                            </p>

                            <p className="text-sm text-gray-700">
                              Stok:{" "}
                              {product.stockType === "ask"
                                ? "Sorunuz"
                                : product.stockQuantity}
                            </p>
                          </div>

                          <div className="mt-4">
                            <label className="field-label">Adet</label>
                            <input
                              type="number"
                              min="1"
                              max={
                                product.stockType === "quantity" &&
                                product.stockQuantity !== null
                                  ? product.stockQuantity
                                  : undefined
                              }
                              value={quantities[product.id] || 1}
                              onChange={(e) =>
                                handleQuantityChange(product.id, e.target.value)
                              }
                              className="field-input"
                              disabled={isOutOfStock}
                            />
                          </div>

                          {isOutOfStock ? (
                            <button
                              disabled
                              className="mt-4 w-full rounded-xl bg-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600"
                            >
                              Stokta Yok
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="btn-primary mt-4 w-full"
                            >
                              Sepete Ekle
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
