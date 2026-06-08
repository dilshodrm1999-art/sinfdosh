"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Search, Users, MessageCircle, Sparkles } from "lucide-react";
import Shell from "@/components/Shell";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <Shell rightColumn={<RightColumn user={user} />}>
      <Feed user={user} />
    </Shell>
  );
}

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const taRef = useRef(null);

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
    setPosting(true);
    try {
      const post = await api.post("/api/posts/posts/", { text });
      setPosts((p) => [post, ...p]);
      setText("");
      if (taRef.current) taRef.current.style.height = "auto";
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-4 px-1 text-2xl font-bold tracking-tight">Bosh sahifa</h1>

      <div className="card mb-5">
        <form onSubmit={createPost} className="flex gap-3">
          <Avatar user={user} size={44} />
          <div className="flex-1">
            <textarea
              ref={taRef}
              rows={2}
              className="input resize-none border-0 bg-transparent px-0 focus:ring-0 dark:bg-transparent"
              placeholder={`Nima yangiliklar, ${user?.first_name}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
              <button type="button" className="btn-icon" aria-label="Rasm">
                <ImagePlus className="h-5 w-5 text-emerald-500" />
              </button>
              <button type="submit" className="btn-primary" disabled={posting || !text.trim()}>
                {posting ? "Joylanmoqda..." : "Joylash"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <Sparkles className="h-8 w-8 text-brand-400" />
          <p>Hali postlar yo'q. Birinchi bo'lib post joylang!</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

function RightColumn({ user }) {
  const links = [
    { href: "/search", label: "Sinfdoshlarni qidirish", icon: Search, color: "text-sky-500" },
    { href: "/friends", label: "Do'stlik so'rovlari", icon: Users, color: "text-emerald-500" },
    { href: "/chat", label: "Xabarlar", icon: MessageCircle, color: "text-violet-500" },
  ];
  return (
    <>
      <div className="card">
        <div className="-m-5 mb-3 h-20 rounded-t-2xl bg-gradient-to-r from-brand-500 to-violet-500" />
        <div className="-mt-12 flex flex-col items-center text-center">
          <Avatar user={user} size={72} />
          <div className="mt-2 font-semibold">{user?.full_name}</div>
          <div className="text-xs text-gray-400">
            {user?.school_detail?.name || "Maktab tanlanmagan"}
          </div>
          {user?.classroom_detail && (
            <span className="chip mt-2">{user.classroom_detail.name}</span>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-gray-500">Tezkor havolalar</h3>
        <div className="space-y-1">
          {links.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Icon className={`h-5 w-5 ${color}`} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-2 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
