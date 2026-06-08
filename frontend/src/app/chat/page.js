"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChatListPage() {
  return (
    <Shell>
      <ChatList />
    </Shell>
  );
}

function timeAgo(date) {
  if (!date) return "";
  const d = (Date.now() - new Date(date)) / 1000;
  if (d < 60) return "hozir";
  if (d < 3600) return `${Math.floor(d / 60)}d`;
  if (d < 86400) return `${Math.floor(d / 3600)}s`;
  return new Date(date).toLocaleDateString("uz");
}

function ChatList() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/chat/chats/").then((d) => {
      setChats(d.results || d);
      setLoading(false);
    });
  }, []);

  function title(chat) {
    if (chat.title) return chat.title;
    if (chat.type === "private") {
      const other = chat.members_detail?.find((m) => m.id !== user.id);
      return other?.full_name || "Suhbat";
    }
    return `${chat.type} chat`;
  }

  return (
    <div>
      <h1 className="mb-4 px-1 text-2xl font-bold tracking-tight">Xabarlar</h1>
      {loading ? (
        <p className="text-center text-gray-400">Yuklanmoqda...</p>
      ) : chats.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <MessageCircle className="h-8 w-8 text-brand-400" />
          <p>Hali suhbatlar yo'q. Qidiruv orqali kimgadir yozing.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          {chats.map((c) => {
            const other = c.members_detail?.find((m) => m.id !== user.id);
            return (
              <button
                key={c.id}
                onClick={() => router.push(`/chat/${c.id}`)}
                className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800"
              >
                <Avatar user={other || { first_name: c.type }} size={52} online={other?.is_online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-semibold">{title(c)}</span>
                    <span className="ml-2 shrink-0 text-xs text-gray-400">{timeAgo(c.last_message?.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm text-gray-500">{c.last_message?.text || "Xabar yo'q"}</span>
                    {c.unread_count > 0 && (
                      <span className="ml-2 shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
