"use client";

import Navbar from "@/client/components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      alert("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          password: trimmedPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Giriş yapılamadı.");
        return;
      }

      alert("Giriş başarılı.");
      const fallbackPath = data.user.role === "admin" ? "/admin" : "/products";
      const nextPath = new URLSearchParams(window.location.search).get("next");
      const targetPath =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : fallbackPath;

      router.push(targetPath);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold">Giriş Yap</h1>
          <p className="mb-6 text-sm text-gray-600">
            Yetkili müşteri hesabı ile giriş yapabilirsiniz.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Şifre</label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black px-4 py-3 text-white"
            >
              {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
