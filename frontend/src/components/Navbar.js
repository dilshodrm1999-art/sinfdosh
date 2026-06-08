"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, getAccess, WS_URL } from "@/lib/api";

const links = [
  { href: "/", label: "Bosh sahifa", icon: "🏠" },
  { href: "/search", label: "Qidiruv", icon: "🔍" },
  { href: "/friends", label: "Do'stlar", icon: "👥" },
  { href: "/chat", label: "Chat", icon: "💬" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let ws;
    async function init() {
      try {
        const data = await api.get("/api/notifications/unread_count/");
        setUnread(data.count || 0);
      } catch {}
      const token = getAccess();
      if (token) {
        ws = new WebSocket(`${WS_URL}/ws/notifications/?token=${token}`);
        ws.onmessage = () => setUnread((c) => c + 1);
      }
    }
    init();
    return () => ws && ws.close();
  }, []);

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Link href="/" className="text-xl font-bold text-brand">
          Sinfdosh
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                pathname === l.href
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="mr-1">{l.icon}</span>
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          ))}
          <Link
            href="/notifications"
            className="relative rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -right-0 -top-0 rounded-full bg-red-500 px-1.5 text-xs text-white">
                {unread}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar user={user} size={28} />
              <span className="hidden text-sm font-medium sm:inline">
                {user.first_name}
              </span>
            </Link>
          )}
          <button onClick={logout} className="text-sm text-red-500">
            Chiqish
          </button>
        </div>
      </div>
    </nav>
  );
}

export function Avatar({ user, size = 40 }) {
  const initials = `${user?.first_name?.[0] || ""}${
    user?.last_name?.[0] || ""
  }`.toUpperCase();
  if (user?.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={initials}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      className="flex items-center justify-center rounded-full bg-brand font-semibold text-white"
    >
      {initials || "?"}
    </div>
  );
}
