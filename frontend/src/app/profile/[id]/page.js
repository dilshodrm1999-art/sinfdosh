"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { Avatar } from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  return (
    <Shell>
      <Profile />
    </Shell>
  );
}

function Profile() {
  const { id } = useParams();
  const router = useRouter();
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const isMe = me && String(me.id) === String(id);

  async function load() {
    const data = isMe ? me : await api.get(`/api/auth/users/${id}/`);
    setProfile(data);
    setForm({ bio: data.bio || "", living_place: data.living_place || "" });
    const p = await api.get(`/api/posts/posts/?author=${id}`);
    setPosts(p.results || p);
  }

  useEffect(() => {
    if (me) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, me]);

  async function save() {
    await api.patch("/api/auth/me/", form);
    await refreshUser();
    setEditing(false);
    load();
  }

  async function addFriend() {
    await api.post("/api/friends/", { to_user: profile.id });
    alert("So'rov yuborildi");
  }
  async function message() {
    const chat = await api.post("/api/chat/chats/private/", { user_id: profile.id });
    router.push(`/chat/${chat.id}`);
  }

  if (!profile) return <div className="text-gray-500">Yuklanmoqda...</div>;

  return (
    <div>
      <div className="card overflow-hidden p-0">
        <div className="h-32 bg-gradient-to-r from-brand to-brand-light">
          {profile.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-10 flex items-end gap-4">
            <div className="rounded-full border-4 border-white dark:border-gray-900">
              <Avatar user={profile} size={80} />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-xl font-bold">
                {profile.full_name}
                {profile.is_verified && <span className="ml-1 text-brand">✓</span>}
              </h1>
              <div className="text-sm text-gray-500">
                {profile.school_detail?.name}
                {profile.classroom_detail && ` · ${profile.classroom_detail.name}`}
                {profile.graduation_year && ` · ${profile.graduation_year}-yil`}
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              {isMe ? (
                <button onClick={() => setEditing(!editing)} className="btn-ghost text-sm">
                  ✏️ Tahrirlash
                </button>
              ) : (
                <>
                  <button onClick={addFriend} className="btn-ghost text-sm">➕ Do'st</button>
                  <button onClick={message} className="btn-primary text-sm">💬 Yozish</button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-4 space-y-2">
              <textarea
                className="input"
                placeholder="O'zingiz haqingizda..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <input
                className="input"
                placeholder="Yashash joyi"
                value={form.living_place}
                onChange={(e) => setForm({ ...form, living_place: e.target.value })}
              />
              <button onClick={save} className="btn-primary text-sm">Saqlash</button>
            </div>
          ) : (
            <div className="mt-4 text-sm">
              {profile.bio && <p className="mb-1">{profile.bio}</p>}
              {profile.living_place && (
                <p className="text-gray-500">📍 {profile.living_place}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="my-4 text-lg font-bold">Postlar</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">Postlar yo'q</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
