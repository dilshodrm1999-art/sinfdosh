"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import PostCard from "@/components/PostCard";
import { Avatar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  return (
    <Shell>
      <Feed />
    </Shell>
  );
}

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api.get("/api/posts/posts/");
    setPosts(data.results || data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createPost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const post = await api.post("/api/posts/posts/", { text });
    setPosts((p) => [post, ...p]);
    setText("");
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="card mb-4">
          <form onSubmit={createPost} className="flex gap-3">
            <Avatar user={user} />
            <div className="flex-1">
              <textarea
                className="input min-h-[60px] resize-none"
                placeholder="Nima yangiliklar?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button className="btn-primary">Joylash</button>
              </div>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Yuklanmoqda...</div>
        ) : posts.length === 0 ? (
          <div className="card text-center text-gray-500">
            Hali postlar yo'q. Birinchi bo'lib post joylang!
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>

      <aside className="hidden md:block">
        <div className="card">
          <h3 className="mb-2 font-semibold">Profil</h3>
          <div className="flex items-center gap-3">
            <Avatar user={user} size={48} />
            <div>
              <div className="font-medium">{user?.full_name}</div>
              <div className="text-xs text-gray-500">
                {user?.school_detail?.name || "Maktab tanlanmagan"}
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-4">
          <h3 className="mb-2 font-semibold">Tezkor havolalar</h3>
          <ul className="space-y-1 text-sm text-brand">
            <li><a href="/search">🔍 Sinfdoshlarni qidirish</a></li>
            <li><a href="/friends">👥 Do'stlik so'rovlari</a></li>
            <li><a href="/chat">💬 Xabarlar</a></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
