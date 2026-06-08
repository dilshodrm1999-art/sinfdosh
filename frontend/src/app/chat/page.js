"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { Avatar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChatListPage() {
  return (
    <Shell>
      <ChatList />
    </Shell>
  );
}

function ChatList() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    api.get("/api/chat/chats/").then((d) => setChats(d.results || d));
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
      <h1 className="mb-4 text-2xl font-bold">Xabarlar</h1>
      {chats.length === 0 && (
        <p className="text-gray-500">
          Hali suhbatlar yo'q. Qidiruv orqali kimgadir yozing.
        </p>
      )}
      <div className="space-y-2">
        {chats.map((c) => {
          const other = c.members_detail?.find((m) => m.id !== user.id);
          return (
            <button
              key={c.id}
              onClick={() => router.push(`/chat/${c.id}`)}
              className="card flex w-full items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Avatar user={other || { first_name: c.type }} />
              <div className="flex-1">
                <div className="font-medium">{title(c)}</div>
                <div className="truncate text-sm text-gray-500">
                  {c.last_message?.text || "Xabar yo'q"}
                </div>
              </div>
              {c.unread_count > 0 && (
                <span className="rounded-full bg-brand px-2 text-xs text-white">
                  {c.unread_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
