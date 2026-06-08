"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-violet-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold">
          <GraduationCap className="h-7 w-7" /> Sinfdosh
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Sinfdoshlaringizni qayta toping
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Maktabdosh va sinfdoshlar bilan bog'laning, suhbatlashing va eski
            do'stликни tiklang.
          </p>
        </div>
        <div className="text-sm text-white/60">© 2026 Sinfdosh</div>
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-5 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold">Sinfdosh</span>
          </div>

          <h2 className="text-2xl font-bold">Xush kelibsiz 👋</h2>
          <p className="mt-1 text-sm text-gray-500">Hisobingizga kiring</p>

          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Telefon raqam</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  className="input pl-10"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={show ? "text" : "password"}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Hisobingiz yo'qmi?{" "}
            <Link href="/register" className="font-semibold text-brand-600">
              Ro'yxatdan o'ting
            </Link>
          </p>
          <div className="mt-4 rounded-xl bg-gray-100 p-3 text-center text-xs text-gray-500 dark:bg-gray-800">
            Demo: <b>+998901111111</b> / <b>demo12345</b>
          </div>
        </div>
      </div>
    </div>
  );
}
