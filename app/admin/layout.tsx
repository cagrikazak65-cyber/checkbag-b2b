"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LoggedInUser = {
  username: string;
  company: string;
  role?: "admin" | "customer";
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
      alert("Bu sayfayı görmek için giriş yapmalısınız.");
      router.push("/login");
      return;
    }

    const user: LoggedInUser = JSON.parse(storedUser);

    if (user.role !== "admin") {
      alert("Bu alan yalnızca yöneticiye açıktır.");
      router.push("/products");
      return;
    }

    setAllowed(true);
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