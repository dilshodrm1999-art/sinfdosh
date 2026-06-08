"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Users,
  MessageCircle,
  Bell,
  Moon,
  Sun,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { api, getAccess, WS_URL } from "@/lib/api";
import Avatar from "./Avatar";

const NAV = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/search", label: "Qidiruv", icon: Search },
  { href: "/friends", label: "Do'stlar", icon: Users },
  { href: "/chat", label: "Xabarlar", icon: MessageCircle },
  { href: "/notifications", label: "Bildirishnoma", icon: Bell },
];

export default function Shell({ children, rightColumn = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let ws;
    (async () => {
      try {
        const data = await api.get("/api/notifications/unread_count/");
        setUnread(data.count || 0);
      } catch {}
      const token = getAccess();
      if (token) {
        ws = new WebSocket(`${WS_URL}/ws/notifications/?token=${token}`);
        ws.onmessage = () => setUnread((c) => c + 1);
      }
    })();
    return () => ws && ws.close();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <GraduationCap className="h-10 w-10 animate-pulse text-brand-500" />
          <span className="text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      {/* Desktop sidebar */}
      <Sidebar user={user} unread={unread} />

      {/* Main */}
      <div className="flex w-full flex-1 flex-col lg:pl-0">
        <MobileHeader unread={unread} />
        <div className="flex flex-1 justify-center gap-6 px-3 py-4 sm:px-5 lg:py-6">
          <main className="w-full max-w-2xl pb-24 lg:pb-6 animate-fade-in">
            {children}
          </main>
          {rightColumn && (
            <aside className="hidden w-72 shrink-0 xl:block">
              <div className="sticky top-6 space-y-4">{rightColumn}</div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav unread={unread} />
    </div>
  );
}

function Sidebar({ user, unread }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { logout } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-900 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-glow">
          <GraduationCap className="h-6 w-6" />
        </span>
        <span className="text-xl font-bold tracking-tight">Sinfdosh</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              {href === "/notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 dark:border-gray-800">
        <button onClick={toggle} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {theme === "dark" ? "Yorug' rejim" : "Tungi rejim"}
        </button>
        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <Avatar user={user} size={36} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.full_name}</div>
            <div className="truncate text-xs text-gray-400">Profilim</div>
          </div>
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
          <LogOut className="h-5 w-5" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

function MobileHeader({ unread }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold">Sinfdosh</span>
      </Link>
      <div className="flex items-center gap-1">
        <button onClick={toggle} className="btn-icon">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Link href="/notifications" className="btn-icon relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
          )}
        </Link>
      </div>
    </header>
  );
}

function BottomNav({ unread }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-20 flex w-full items-center justify-around border-t border-gray-100 bg-white/90 px-2 py-1.5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 lg:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition ${
              active ? "text-brand-600 dark:text-brand-400" : "text-gray-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
            {href === "/notifications" && unread > 0 && (
              <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
