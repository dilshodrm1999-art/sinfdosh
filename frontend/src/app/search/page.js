"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, UserPlus, MessageCircle, SlidersHorizontal } from "lucide-react";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
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
  const [filters, setFilters] = useState({ search: "", region: "", district: "", school: "", graduation_year: "" });
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  async function doSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
    const data = await api.get(`/api/auth/users/?${params.toString()}`);
    setResults(data.results || data);
    setLoading(false);
  }

  async function addFriend(id) {
    await api.post("/api/friends/", { to_user: id });
  }
  async function startChat(id) {
    const chat = await api.post("/api/chat/chats/private/", { user_id: id });
    router.push(`/chat/${chat.id}`);
  }

  return (
    <div>
      <h1 className="mb-4 px-1 text-2xl font-bold tracking-tight">Qidiruv</h1>

      <form onSubmit={doSearch} className="card mb-5 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input className="input pl-10" placeholder="Ism yoki familiya..." value={filters.search} onChange={(e) => set("search", e.target.value)} />
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-outline !px-3" aria-label="Filtrlar">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <button className="btn-primary">Qidirish</button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2 dark:border-gray-800">
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
          </div>
        )}
      </form>

      {loading ? (
        <p className="text-center text-gray-400">Qidirilmoqda...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {results.map((u) => (
            <div key={u.id} className="card flex items-center gap-3">
              <Avatar user={u} size={56} />
              <div className="min-w-0 flex-1">
                <Link href={`/profile/${u.id}`} className="block truncate font-semibold hover:underline">
                  {u.full_name}
                </Link>
                <div className="truncate text-xs text-gray-400">{u.school_detail?.name || "—"}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => addFriend(u.id)} className="btn-icon" aria-label="Do'st qo'shish" title="Do'st qo'shish">
                  <UserPlus className="h-5 w-5 text-brand-600" />
                </button>
                <button onClick={() => startChat(u.id)} className="btn-icon" aria-label="Yozish" title="Xabar yozish">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                </button>
              </div>
            </div>
          ))}
          {searched && results.length === 0 && (
            <p className="col-span-full py-8 text-center text-gray-400">Natija topilmadi. Filtrlarni o'zgartiring.</p>
          )}
          {!searched && (
            <p className="col-span-full py-8 text-center text-gray-400">Sinfdoshlarni topish uchun qidiring 🔍</p>
          )}
        </div>
      )}
    </div>
  );
}
