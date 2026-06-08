"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { Avatar } from "@/components/Navbar";
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <h2 className="mb-3 text-xl font-bold">
          Do'stlik so'rovlari ({requests.length})
        </h2>
        {requests.length === 0 && (
          <p className="text-gray-500">Yangi so'rovlar yo'q</p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="card mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar user={r.from_user_detail} />
              <Link href={`/profile/${r.from_user_detail.id}`} className="font-medium">
                {r.from_user_detail.full_name}
              </Link>
            </div>
            <div className="flex gap-2">
              <button onClick={() => accept(r.id)} className="btn-primary text-xs">
                Qabul
              </button>
              <button onClick={() => reject(r.id)} className="btn-ghost text-xs">
                Rad
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Do'stlar ({friends.length})</h2>
        {friends.length === 0 && <p className="text-gray-500">Hali do'stlar yo'q</p>}
        {friends.map((f) => (
          <div key={f.id} className="card mb-2 flex items-center gap-3">
            <Avatar user={f} />
            <Link href={`/profile/${f.id}`} className="font-medium">
              {f.full_name}
            </Link>
            {f.is_online && (
              <span className="ml-auto text-xs text-green-500">● online</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
