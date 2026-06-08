"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Shell from "@/components/Shell";
import { Avatar } from "@/components/Navbar";
import { api, API_URL } from "@/lib/api";

export default function SearchPage() {
  return (
    <Shell>
      <Search />
    </Shell>
  );
}

function Search() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: "",
    region: "",
    district: "",
    school: "",
    graduation_year: "",
  });
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/geo/regions/`).then((r) => r.json()).then((d) => setRegions(d.results || d));
  }, []);
  useEffect(() => {
    if (!filters.region) return setDistricts([]);
    fetch(`${API_URL}/api/geo/districts/?region=${filters.region}`).then((r) => r.json()).then((d) => setDistricts(d.results || d));
  }, [filters.region]);
  useEffect(() => {
    if (!filters.district) return setSchools([]);
    fetch(`${API_URL}/api/geo/schools/?district=${filters.district}`).then((r) => r.json()).then((d) => setSchools(d.results || d));
  }, [filters.district]);

  function set(k, v) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  async function doSearch(e) {
    e?.preventDefault();
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
    const data = await api.get(`/api/auth/users/?${params.toString()}`);
    setResults(data.results || data);
    setLoading(false);
  }

  async function addFriend(userId) {
    await api.post("/api/friends/", { to_user: userId });
    alert("Do'stlik so'rovi yuborildi");
  }

  async function startChat(userId) {
    const chat = await api.post("/api/chat/chats/private/", { user_id: userId });
    router.push(`/chat/${chat.id}`);
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Sinfdoshlarni qidirish</h1>

      <form onSubmit={doSearch} className="card mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input className="input" placeholder="Ism yoki familiya" value={filters.search} onChange={(e) => set("search", e.target.value)} />
        <select className="input" value={filters.region} onChange={(e) => set("region", e.target.value)}>
          <option value="">Viloyat</option>
          {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className="input" value={filters.district} onChange={(e) => set("district", e.target.value)}>
          <option value="">Shahar/Tuman</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input" value={filters.school} onChange={(e) => set("school", e.target.value)}>
          <option value="">Maktab</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="input" type="number" placeholder="Bitiruv yili" value={filters.graduation_year} onChange={(e) => set("graduation_year", e.target.value)} />
        <button className="btn-primary">Qidirish</button>
      </form>

      {loading ? (
        <div className="text-center text-gray-500">Qidirilmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((u) => (
            <div key={u.id} className="card flex flex-col items-center text-center">
              <Avatar user={u} size={64} />
              <Link href={`/profile/${u.id}`} className="mt-2 font-semibold hover:underline">
                {u.full_name}
              </Link>
              <div className="text-xs text-gray-500">
                {u.school_detail?.name || ""}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => addFriend(u.id)} className="btn-ghost text-xs">
                  ➕ Do'st
                </button>
                <button onClick={() => startChat(u.id)} className="btn-primary text-xs">
                  💬 Yozish
                </button>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              Natija yo'q. Filtrlarni o'zgartiring.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
