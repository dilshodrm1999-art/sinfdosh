"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { api, getAccess, WS_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChatPage() {
  return (
    <Shell>
      <ChatRoom />
    </Shell>
  );
}

function ChatRoom() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState("");
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Eski xabarlarni yuklash
  useEffect(() => {
    api.get(`/api/chat/chats/${id}/messages/`).then((d) =>
      setMessages(d.results || d)
    );
  }, [id]);

  // WebSocket ulanish
  useEffect(() => {
    const token = getAccess();
    const ws = new WebSocket(`${WS_URL}/ws/chat/${id}/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === "message") {
        setMessages((m) => [
          ...m,
          {
            id: data.id,
            text: data.text,
            sender: data.sender,
            sender_detail: { full_name: data.sender_name },
            created_at: data.created_at,
          },
        ]);
      } else if (data.event === "typing") {
        setTyping(`${data.user_name} yozmoqda...`);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(""), 2000);
      }
    };

    return () => ws.close();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    if (!text.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "message", text }));
    setText("");
  }

  function onType() {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "typing" }));
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => router.push("/chat")} className="btn-ghost text-sm">
          ← Orqaga
        </button>
        <span className="text-sm text-gray-500">{typing}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-white p-4 dark:bg-gray-900">
        {messages.map((m) => {
          const mine = m.sender === user.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "bg-brand text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {!mine && (
                  <div className="text-xs font-semibold opacity-70">
                    {m.sender_detail?.full_name}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-2 flex gap-2">
        <input
          className="input"
          placeholder="Xabar yozing..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onType();
          }}
        />
        <button className="btn-primary">Yuborish</button>
      </form>
    </div>
  );
}
