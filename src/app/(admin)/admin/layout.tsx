"use client";

import Navbar from "@/client/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });

      if (response.status === 401) {
        alert("Bu sayfayı görmek için giriş yapmalısınız.");
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (data.user?.role !== "admin") {
        alert("Bu alan yalnızca yöneticiye açıktır.");
        router.push("/products");
        return;
      }

      setAllowed(true);
    };

    void checkAccess();
  }, [router]);

  if (!allowed) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="page-container">
            <div className="empty-state">Yetki kontrol ediliyor...</div>
          </div>
        </main>
      </>
    );
  }

  return <>{children}</>;
}
