"use client";

import { useEffect, useState } from "react";
import { Heart, MessageSquare, Users, Bell } from "lucide-react";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  return (
    <Shell>
      <Notifications />
    </Shell>
  );
}

function iconFor(verb) {
  if (verb === "like") return <Heart className="h-4 w-4 text-rose-500" />;
  if (verb === "comment") return <MessageSquare className="h-4 w-4 text-sky-500" />;
  if (verb?.includes("friend")) return <Users className="h-4 w-4 text-emerald-500" />;
  return <Bell className="h-4 w-4 text-brand-500" />;
}

function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await api.get("/api/notifications/");
      setItems(data.results || data);
      setLoading(false);
      api.post("/api/notifications/read_all/", {}).catch(() => {});
    })();
  }, []);

  return (
    <div>
      <h1 className="mb-4 px-1 text-2xl font-bold tracking-tight">Bildirishnomalar</h1>
      {loading ? (
        <p className="text-center text-gray-400">Yuklanmoqda...</p>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <Bell className="h-8 w-8 text-brand-400" />
          <p>Bildirishnomalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`card flex items-center gap-3 ${n.is_read ? "" : "ring-1 ring-brand-200 dark:ring-brand-900"}`}>
              <div className="relative">
                <Avatar user={n.actor_detail || {}} size={44} />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                  {iconFor(n.verb)}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-semibold">{n.actor_detail?.full_name} </span>
                {n.text}
                <div className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString("uz")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
