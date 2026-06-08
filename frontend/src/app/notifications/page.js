"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  return (
    <Shell>
      <Notifications />
    </Shell>
  );
}

function Notifications() {
  const [items, setItems] = useState([]);

  async function load() {
    const data = await api.get("/api/notifications/");
    setItems(data.results || data);
  }

  useEffect(() => {
    load();
    api.post("/api/notifications/read_all/", {}).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Bildirishnomalar</h1>
      {items.length === 0 && <p className="text-gray-500">Bildirishnomalar yo'q</p>}
      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            className={`card flex items-center gap-3 ${
              n.is_read ? "" : "border-l-4 border-brand"
            }`}
          >
            <span className="text-xl">
              {n.verb === "like" ? "❤️" : n.verb === "comment" ? "💬" : n.verb.includes("friend") ? "👥" : "🔔"}
            </span>
            <div>
              <span className="font-medium">{n.actor_detail?.full_name} </span>
              {n.text}
              <div className="text-xs text-gray-500">
                {new Date(n.created_at).toLocaleString("uz")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
