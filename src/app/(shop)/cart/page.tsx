"use client";

import Navbar from "@/client/components/Navbar";
import ProductImage from "@/client/components/ProductImage";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrencyFromCents } from "@/lib/money";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceCents: number;
  vatRate: number;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  status: "Aktif" | "Pasif";
  description?: string;
  image?: string;
  quantity: number;
  vatAmount: number;
  lineSubtotal: number;
  lineTotal: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      try {
        setError("");
        const response = await fetch("/api/cart", { cache: "no-store" });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Sepet yuklenemedi.");
          return;
        }

        setCartItems(data.cartItems ?? []);
      } catch {
        setError("Sepet yuklenirken bir hata olustu.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCart();
  }, [router]);

  const updateQuantity = async (index: number, value: string) => {
    if (value === "") {
      return;
    }

    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue < 1) {
      return;
    }

    const item = cartItems[index];

    if (
      item.stockType === "quantity" &&
      item.stockQuantity !== null &&
      numericValue > item.stockQuantity
    ) {
      alert("Stok miktarından fazla adet giremezsiniz.");
      return;
    }

    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.id, quantity: numericValue }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Sepet güncellenemedi.");
      return;
    }

    setCartItems(data.cartItems ?? []);
  };

  const removeFromCart = async (index: number) => {
    const response = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: cartItems[index].id }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Ürün sepetten silinemedi.");
      return;
    }

    setCartItems(data.cartItems ?? []);
  };

  const clearCart = async () => {
    const response = await fetch("/api/cart", { method: "DELETE" });

    if (!response.ok) {
      alert("Sepet temizlenemedi.");
      return;
    }

    setCartItems([]);
  };

  const lineSubtotal = (item: CartItem) => {
    return item.lineSubtotal;
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineSubtotal, 0),
    [cartItems]
  );

  const totalVat = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.vatAmount, 0),
    [cartItems]
  );

  const grandTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Sepetim</h1>
              <p className="page-subtitle">
                Sepetinizdeki ürünleri buradan düzenleyebilirsiniz.
              </p>
            </div>

            <button
              onClick={() => router.push("/products")}
              className="btn-secondary"
            >
              Ürünlere Dön
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state">Sepet yükleniyor...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : cartItems.length === 0 ? (
            <div className="empty-state">Sepetiniz şu anda boş.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {cartItems.map((item, index) => (
                  <div key={index} className="surface-card p-4 md:p-5">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="w-full md:w-44">
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border bg-gray-50 p-2">
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            sizes="176px"
                            className="object-contain p-2"
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="panel-card-meta">{item.category}</p>
                        <h2 className="panel-card-title">{item.name}</h2>

                        <p className="panel-card-text">
                          {item.description || "Açıklama yok"}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm text-gray-700">
                          <p className="text-base font-semibold text-gray-900">
                            Birim Fiyat: {formatCurrencyFromCents(item.priceCents)}
                          </p>

                          <p>KDV Oranı: %{item.vatRate}</p>

                          <p>
                            Stok:{" "}
                            {item.stockType === "ask"
                              ? "Sorunuz"
                              : item.stockQuantity}
                          </p>

                          <p className="text-base font-semibold text-gray-900">
                            Ara Toplam: {formatCurrencyFromCents(lineSubtotal(item))}
                          </p>

                          <p className="text-sm text-gray-700">
                            KDV Tutarı: {formatCurrencyFromCents(item.vatAmount)}
                          </p>

                          <p className="text-base font-semibold text-gray-900">
                            Genel Toplam: {formatCurrencyFromCents(item.lineTotal)}
                          </p>
                        </div>

                        <div className="mt-4 max-w-[180px]">
                          <label className="field-label">Adet</label>
                          <input
                            type="number"
                            min="1"
                            max={
                              item.stockType === "quantity" &&
                              item.stockQuantity !== null
                                ? item.stockQuantity
                                : undefined
                            }
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(index, e.target.value)
                            }
                            className="field-input"
                          />
                        </div>
                      </div>

                      <div className="flex items-start">
                        <button
                          onClick={() => removeFromCart(index)}
                          className="btn-danger"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="surface-card h-fit p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sepet Özeti
                </h2>

                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Ürün Çeşidi</span>
                    <span className="font-semibold">{cartItems.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Ara Toplam</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrencyFromCents(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>KDV Tutarı</span>
                    <span className="font-semibold">
                      {formatCurrencyFromCents(totalVat)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Genel Toplam</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrencyFromCents(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="btn-primary w-full"
                  >
                    Siparişi Tamamla
                  </button>

                  <button
                    onClick={clearCart}
                    className="btn-secondary w-full"
                  >
                    Sepeti Temizle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
