"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", birth_year: "", gender: "male",
    password: "", password2: "", region: "", district: "", school: "",
    classroom: "", graduation_year: "",
  });
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/geo/regions/`).then((r) => r.json()).then((d) => setRegions(d.results || d)).catch(() => {});
  }, []);
  useEffect(() => {
    if (!form.region) return;
    fetch(`${API_URL}/api/geo/districts/?region=${form.region}`).then((r) => r.json()).then((d) => setDistricts(d.results || d));
  }, [form.region]);
  useEffect(() => {
    if (!form.district) return;
    fetch(`${API_URL}/api/geo/schools/?district=${form.district}`).then((r) => r.json()).then((d) => setSchools(d.results || d));
  }, [form.district]);
  useEffect(() => {
    if (!form.school) return;
    fetch(`${API_URL}/api/geo/classrooms/?school=${form.school}`).then((r) => r.json()).then((d) => setClassrooms(d.results || d));
  }, [form.school]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.password2) {
      setError("Parollar mos emas");
      return;
    }
    setLoading(true);
    const payload = { ...form };
    ["region", "district", "school", "classroom", "birth_year", "graduation_year"].forEach((k) => {
      if (!payload[k]) delete payload[k];
      else payload[k] = Number(payload[k]);
    });
    try {
      const res = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      await login(form.phone, form.password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="card w-full max-w-lg animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-glow">
            <GraduationCap className="h-7 w-7" />
          </span>
          <h1 className="mt-3 text-2xl font-bold">Ro'yxatdan o'tish</h1>
          <p className="text-sm text-gray-500">2 ta oddiy qadam</p>
        </div>

        {/* Steps indicator */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition ${step >= s ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"}`} />
          ))}
        </div>

        {error && (
          <div className="mb-4 break-words rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Ism</label>
                <input className="input" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
              </div>
              <div>
                <label className="label">Familiya</label>
                <input className="input" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Telefon</label>
                <input className="input" placeholder="+998..." value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
              <div>
                <label className="label">Tug'ilgan yil</label>
                <input type="number" className="input" value={form.birth_year} onChange={(e) => set("birth_year", e.target.value)} />
              </div>
              <div>
                <label className="label">Jins</label>
                <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
              </div>
              <div>
                <label className="label">Parol</label>
                <input type="password" className="input" value={form.password} onChange={(e) => set("password", e.target.value)} required />
              </div>
              <div>
                <label className="label">Parolni tasdiqlang</label>
                <input type="password" className="input" value={form.password2} onChange={(e) => set("password2", e.target.value)} required />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary col-span-full mt-2"
              >
                Davom etish <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Viloyat</label>
                <select className="input" value={form.region} onChange={(e) => set("region", e.target.value)}>
                  <option value="">Tanlang</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Shahar/Tuman</label>
                <select className="input" value={form.district} onChange={(e) => set("district", e.target.value)}>
                  <option value="">Tanlang</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Maktab</label>
                <select className="input" value={form.school} onChange={(e) => set("school", e.target.value)}>
                  <option value="">Tanlang</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sinf</label>
                <select className="input" value={form.classroom} onChange={(e) => set("classroom", e.target.value)}>
                  <option value="">Tanlang</option>
                  {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.graduation_year})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bitirgan yil</label>
                <input type="number" className="input" value={form.graduation_year} onChange={(e) => set("graduation_year", e.target.value)} />
              </div>
              <div className="col-span-full mt-2 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                  <ChevronLeft className="h-4 w-4" /> Orqaga
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? "Yuborilmoqda..." : "Yakunlash"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Hisobingiz bormi? <Link href="/login" className="font-semibold text-brand-600">Kirish</Link>
        </p>
      </div>
    </div>
  );
}
