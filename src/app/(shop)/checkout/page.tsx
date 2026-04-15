"use client";

import Navbar from "@/client/components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceCents: number;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  status: "Aktif" | "Pasif";
  description?: string;
  image?: string;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("EFT / Havale");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCheckout = async () => {
      const [meResponse, cartResponse] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/cart", { cache: "no-store" }),
      ]);

      if (meResponse.status === 401 || cartResponse.status === 401) {
        router.push("/login");
        return;
      }

      const [meData, cartData] = await Promise.all([
        meResponse.json(),
        cartResponse.json(),
      ]);
      const parsedCart: CartItem[] = cartData.cartItems ?? [];

      if (parsedCart.length === 0) {
        router.push("/cart");
        return;
      }

      setCompanyName(meData.user?.company || "");
      setCartItems(parsedCart);
      setIsReady(true);
    };

    void loadCheckout();
  }, [router]);

  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );
  }, [cartItems]);

  const handleCreateOrder = async () => {
    const trimmedNote = note.trim();
    const trimmedPaymentMethod = paymentMethod.trim();

    if (!trimmedNote) {
      alert("Lütfen sipariş notu alanını doldurun.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Sepetiniz şu anda boş.");
      router.push("/cart");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: trimmedPaymentMethod,
          note: trimmedNote,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Sipariş oluşturulamadı.");
        return;
      }

      alert("Sipariş alındı. Yönetici onayı bekleniyor.");
      router.push("/orders");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInvalidCartItem = cartItems.some((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) return true;
    if (item.status !== "Aktif") return true;
    if (item.priceCents <= 0) return true;

    return (
      item.stockType === "quantity" &&
      item.stockQuantity !== null &&
      item.quantity > item.stockQuantity
    );
  });

  if (!isReady) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="page-container">
            <div className="empty-state">Yükleniyor...</div>
          </div>
        </main>
      </>
    );
  }

  if (hasInvalidCartItem || totalAmount <= 0) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="page-container">
            <div className="empty-state">
              Sepetinizde güncellenmesi gereken ürün var.
              <button
                onClick={() => router.push("/cart")}
                className="btn-primary mt-4"
              >
                Sepete Dön
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Sipariş Tamamlama</h1>
              <p className="page-subtitle">Firma: {companyName}</p>
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="btn-secondary"
            >
              Sepete Dön
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Ödeme ve Sipariş Bilgileri
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="field-label">Ödeme Yöntemi</label>
                  <select
                    className="field-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="EFT / Havale">EFT / Havale</option>
                    <option value="Nakit">Nakit</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Açık Hesap / Vade">Açık Hesap / Vade</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Sipariş Notu</label>
                  <textarea
                    rows={7}
                    className="field-textarea"
                    placeholder="Siparişle ilgili notunuzu yazınız. Teslimat, ödeme, ürün isteği veya özel bilgilendirme ekleyebilirsiniz. Toptancınızı yazınız."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Bu alan zorunludur.
                  </p>
                </div>

                <button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting}
                  className="btn-primary w-full"
                >
                  {isSubmitting ? "Sipariş Gönderiliyor..." : "Siparişi Gönder"}
                </button>
              </div>
            </div>

            <div className="surface-card p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Sipariş Özeti
              </h2>

              <div className="mt-5 space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.category}
                      </p>
                      <p className="mt-2 text-sm text-gray-700">
                        Adet: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-700">
                        Birim Fiyat: {item.price}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Toplam</p>
                      <p className="text-base font-semibold text-gray-900">
                        {formatMoney(item.priceCents * item.quantity)} TL
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Genel Toplam</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatMoney(totalAmount)} TL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
