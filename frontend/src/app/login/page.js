"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand">
          Sinfdosh
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Hisobingizga kiring
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Telefon raqam</label>
            <input
              className="input"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Parol</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Hisobingiz yo'qmi?{" "}
          <Link href="/register" className="text-brand">
            Ro'yxatdan o'ting
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          Demo: +998901111111 / demo12345
        </p>
      </div>
    </div>
  );
}
