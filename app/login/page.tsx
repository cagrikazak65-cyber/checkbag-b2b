"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { users } from "../lib/users";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      setError("Kullanıcı adı veya şifre yanlış.");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    setError("");

    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/products");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-3xl font-bold">Giriş Yap</h1>

        <input
          type="text"
          placeholder="Kullanıcı adı"
          className="mb-3 w-full rounded border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Şifre"
          className="mb-3 w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="mb-3 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full rounded bg-black px-6 py-2 text-white"
        >
          Giriş Yap
        </button>
      </div>
    </main>
  );
}