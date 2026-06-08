"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
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
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState("");
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    api.get(`/api/chat/chats/${id}/messages/`).then((d) => setMessages(d.results || d));
    api.get(`/api/chat/chats/`).then((d) => {
      const list = d.results || d;
      setChat(list.find((c) => String(c.id) === String(id)) || null);
    });
  }, [id]);

  useEffect(() => {
    const token = getAccess();
    const ws = new WebSocket(`${WS_URL}/ws/chat/${id}/?token=${token}`);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === "message") {
        setMessages((m) => [...m, {
          id: data.id, text: data.text, sender: data.sender,
          sender_detail: { full_name: data.sender_name }, created_at: data.created_at,
        }]);
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
  }, [messages, typing]);

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

  const other = chat?.members_detail?.find((m) => m.id !== user.id);
  const title = chat?.title || other?.full_name || "Suhbat";

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
        <button onClick={() => router.push("/chat")} className="btn-icon" aria-label="Orqaga">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar user={other || { first_name: "?" }} size={40} online={other?.is_online} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{title}</div>
          <div className="text-xs text-gray-400">{typing || (other?.is_online ? "online" : "offline")}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="my-3 flex-1 space-y-1.5 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-[#0b0f1a]">
        {messages.map((m, i) => {
          const mine = m.sender === user.id;
          const prev = messages[i - 1];
          const showName = !mine && (!prev || prev.sender !== m.sender);
          return (
            <div key={m.id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  mine
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md bg-white dark:bg-gray-800"
                }`}
              >
                {showName && (
                  <div className="mb-0.5 text-xs font-semibold text-brand-500">
                    {m.sender_detail?.full_name}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <span className={`mt-0.5 block text-right text-[10px] ${mine ? "text-white/70" : "text-gray-400"}`}>
                  {m.created_at ? new Date(m.created_at).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex items-center gap-2">
        <input
          className="input"
          placeholder="Xabar yozing..."
          value={text}
          onChange={(e) => { setText(e.target.value); onType(); }}
        />
        <button className="btn-primary !px-3.5" aria-label="Yuborish" disabled={!text.trim()}>
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
