"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  status: "Aktif" | "Pasif";
  description?: string;
  image?: string;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stockType: "quantity" | "ask";
  stockQuantity: number | null;
  status: "Aktif" | "Pasif";
  description?: string;
  image?: string;
};

type OrderItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  quantity: number;
};

type Order = {
  id: number;
  company: string;
  items: OrderItem[];
  status: "Beklemede" | "Onaylandi" | "Reddedildi" | "Sevk Edildi" | "Teslim Edildi";
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  note: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("EFT / Havale");
  const [note, setNote] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setCompanyName(user.company || "");

    const savedCart = localStorage.getItem("cartItems");
    const parsedCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    if (parsedCart.length === 0) {
      router.push("/cart");
      return;
    }

    setCartItems(parsedCart);
    setIsReady(true);
  }, [router]);

  const getNumericPrice = (price: string) => {
    const cleaned = String(price).replace(/[^\d]/g, "");
    return Number(cleaned) || 0;
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + getNumericPrice(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const handleCreateOrder = () => {
    const storedUser = localStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!note.trim()) {
      alert("Lütfen sipariş notu alanını doldurun.");
      return;
    }

    const storedProducts = localStorage.getItem("adminProducts");
    const allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [];

    for (const item of cartItems) {
      const product = allProducts.find((p) => p.id === item.id);

      if (
        product &&
        product.stockType === "quantity" &&
        product.stockQuantity !== null &&
        item.quantity > product.stockQuantity
      ) {
        alert(item.name + " için yeterli stok yok.");
        return;
      }
    }

    // Sipariş içine sadece gerekli alanları koyuyoruz.
    const compactItems: OrderItem[] = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
    }));

    const newOrder: Order = {
      id: Date.now(),
      company: user.company || "Bilinmeyen Firma",
      items: compactItems,
      status: "Beklemede",
      createdAt: new Date().toLocaleString("tr-TR"),
      totalAmount,
      paymentMethod,
      note,
    };

    try {
      const storedOrders = localStorage.getItem("orders");
      const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
      orders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (error) {
      alert(
        "Tarayıcı depolama alanı dolmuş görünüyor. Eski test siparişlerini temizleyip tekrar deneyin."
      );
      return;
    }

    const updatedProducts = allProducts.map((product) => {
      const cartItem = cartItems.find((item) => item.id === product.id);

      if (!cartItem) return product;

      if (
        product.stockType === "quantity" &&
        product.stockQuantity !== null
      ) {
        return {
          ...product,
          stockQuantity: Math.max(
            0,
            product.stockQuantity - cartItem.quantity
          ),
        };
      }

      return product;
    });

    try {
      localStorage.setItem("adminProducts", JSON.stringify(updatedProducts));
      localStorage.removeItem("cartItems");
    } catch (error) {
      alert("Veriler güncellenirken depolama hatası oluştu.");
      return;
    }

    alert("Sipariş alındı. Yönetici onayı bekleniyor.");
    router.push("/orders");
  };

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
                  className="btn-primary w-full"
                >
                  Siparişi Gönder
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
                        {getNumericPrice(item.price) * item.quantity} TL
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Genel Toplam</span>
                  <span className="text-xl font-bold text-gray-900">
                    {totalAmount} TL
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