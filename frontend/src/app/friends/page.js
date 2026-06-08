"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, UserCheck } from "lucide-react";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";

export default function FriendsPage() {
  return (
    <Shell>
      <Friends />
    </Shell>
  );
}

function Friends() {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [tab, setTab] = useState("friends");

  async function load() {
    const [req, fr] = await Promise.all([
      api.get("/api/friends/requests/"),
      api.get("/api/friends/list_friends/"),
    ]);
    setRequests(req);
    setFriends(fr);
  }
  useEffect(() => {
    load();
  }, []);

  async function accept(id) {
    await api.post(`/api/friends/${id}/accept/`, {});
    load();
  }
  async function reject(id) {
    await api.post(`/api/friends/${id}/reject/`, {});
    load();
  }

  return (
    <div>
      <h1 className="mb-4 px-1 text-2xl font-bold tracking-tight">Do'stlar</h1>

      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {[
          { id: "friends", label: `Do'stlar (${friends.length})` },
          { id: "requests", label: `So'rovlar (${requests.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === t.id ? "bg-white text-brand-700 shadow-sm dark:bg-gray-900 dark:text-brand-300" : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <div className="space-y-2">
          {requests.length === 0 && <Empty text="Yangi so'rovlar yo'q" />}
          {requests.map((r) => (
            <div key={r.id} className="card flex items-center gap-3">
              <Avatar user={r.from_user_detail} size={48} />
              <Link href={`/profile/${r.from_user_detail.id}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">
                {r.from_user_detail.full_name}
              </Link>
              <button onClick={() => accept(r.id)} className="btn-primary !px-3" aria-label="Qabul">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => reject(r.id)} className="btn-ghost !px-3" aria-label="Rad">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "friends" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {friends.length === 0 && <div className="sm:col-span-2"><Empty text="Hali do'stlar yo'q" /></div>}
          {friends.map((f) => (
            <Link key={f.id} href={`/profile/${f.id}`} className="card flex items-center gap-3 transition hover:shadow-soft">
              <Avatar user={f} size={48} online={f.is_online} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{f.full_name}</div>
                <div className="text-xs text-gray-400">{f.is_online ? "online" : "offline"}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center text-gray-400">
      <UserCheck className="h-8 w-8 text-brand-400" />
      <p>{text}</p>
    </div>
  );
}
