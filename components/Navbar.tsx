"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    setLoggedIn(!!storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedIn(false);
    alert("Çıkış yapıldı.");
    router.push("/login");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          CHECK BAG
        </Link>

        <nav className="flex gap-6 text-sm items-center">
          <Link href="/">Ana Sayfa</Link>
          <Link href="/products">Ürünler</Link>

          {!loggedIn ? (
            <Link href="/login">Giriş Yap</Link>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded border px-3 py-1"
            >
              Çıkış Yap
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}