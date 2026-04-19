"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type LoggedInUser = {
  username: string;
  company: string;
  role?: "admin" | "customer";
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.user);
    };

    void loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    alert("Çıkış yapıldı.");
    router.push("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href={isAdmin ? "/admin" : "/"}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border bg-white shadow-sm">
            <Image
              src="/logo.png"
              alt="Check Bag Logo"
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>

          <div>
            <p className="text-lg font-bold leading-none text-gray-900">
              CHECK BAG
            </p>
            <p className="text-xs text-gray-500">B2B Toptan Satış Platformu</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {!user ? (
            <>
              <Link href="/" className="btn-soft">
                Ana Sayfa
              </Link>
              <Link href="/login" className="btn-secondary">
                Giriş Yap
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link href="/admin" className="btn-soft">
                Admin Paneli
              </Link>
              <Link href="/admin/products" className="btn-soft">
                Ürünler
              </Link>
              <Link href="/admin/orders" className="btn-soft">
                Siparişler
              </Link>
              <Link href="/admin/customers" className="btn-soft">
                Müşteriler
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="btn-soft">
                Ana Sayfa
              </Link>
              <Link href="/products" className="btn-soft">
                Ürünler
              </Link>
              <Link href="/cart" className="btn-soft">
                Sepetim
              </Link>
              <Link href="/orders" className="btn-soft">
                Siparişlerim
              </Link>
            </>
          )}
        </nav>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-900">{user.company}</p>
              <p className="text-gray-500">@{user.username}</p>
            </div>

            <button onClick={handleLogout} className="btn-secondary">
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
