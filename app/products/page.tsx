"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type CartItem = Product & {
  quantity: number;
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const storedProducts = localStorage.getItem("adminProducts");
    const allProducts: Product[] = storedProducts
      ? JSON.parse(storedProducts)
      : [];

    const activeProducts = allProducts.filter(
      (product) => product.status === "Aktif"
    );

    setProducts(activeProducts);

    const initialQuantities: Record<number, number> = {};
    activeProducts.forEach((product) => {
      initialQuantities[product.id] = 1;
    });
    setQuantities(initialQuantities);
  }, [router]);

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

  const handleAddToCart = (product: Product) => {
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

    const existingCart = localStorage.getItem("cartItems");
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex !== -1) {
      const newQuantity = cart[existingIndex].quantity + quantity;

      if (
        product.stockType === "quantity" &&
        product.stockQuantity !== null &&
        newQuantity > product.stockQuantity
      ) {
        alert("Sepetteki toplam adet stoktan fazla olamaz.");
        return;
      }

      cart[existingIndex].quantity = newQuantity;
    } else {
      cart.push({
        ...product,
        quantity,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
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

          {products.length === 0 ? (
            <div className="empty-state">Gösterilecek ürün bulunamadı.</div>
          ) : (
            <div className="panel-grid">
              {products.map((product) => {
                const isOutOfStock =
                  product.stockType === "quantity" &&
                  product.stockQuantity !== null &&
                  product.stockQuantity <= 0;

                return (
                  <div key={product.id} className="panel-card">
                    <div className="panel-card-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          Görsel yok
                        </div>
                      )}
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
        </div>
      </main>
    </>
  );
}