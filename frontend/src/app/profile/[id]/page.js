"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, UserPlus, MessageCircle, MapPin, School, BadgeCheck } from "lucide-react";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
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
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await api.patch("/api/auth/me/", form);
      await refreshUser();
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  }
  async function addFriend() {
    await api.post("/api/friends/", { to_user: profile.id });
  }
  async function message() {
    const chat = await api.post("/api/chat/chats/private/", { user_id: profile.id });
    router.push(`/chat/${chat.id}`);
  }

  if (!profile) return <p className="text-center text-gray-400">Yuklanmoqda...</p>;

  return (
    <div>
      <div className="card overflow-hidden p-0">
        <div className="relative h-36 bg-gradient-to-r from-brand-500 via-brand-600 to-violet-600">
          {profile.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
            <Avatar user={profile} size={96} online={profile.is_online} />
            <div className="flex gap-2">
              {isMe ? (
                <button onClick={() => setEditing(!editing)} className="btn-outline">
                  <Pencil className="h-4 w-4" /> Tahrirlash
                </button>
              ) : (
                <>
                  <button onClick={addFriend} className="btn-outline">
                    <UserPlus className="h-4 w-4" /> Do'st
                  </button>
                  <button onClick={message} className="btn-primary">
                    <MessageCircle className="h-4 w-4" /> Yozish
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h1 className="flex items-center gap-1.5 text-xl font-bold">
              {profile.full_name}
              {profile.is_verified && <BadgeCheck className="h-5 w-5 text-brand-500" />}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {profile.school_detail?.name && (
                <span className="flex items-center gap-1"><School className="h-4 w-4" /> {profile.school_detail.name}</span>
              )}
              {profile.classroom_detail && <span className="chip">{profile.classroom_detail.name}</span>}
              {profile.graduation_year && <span>{profile.graduation_year}-yil bitiruvchi</span>}
            </div>
          </div>

          {editing ? (
            <div className="mt-4 space-y-3">
              <textarea className="input" rows={3} placeholder="O'zingiz haqingizda..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              <input className="input" placeholder="Yashash joyi" value={form.living_place} onChange={(e) => setForm({ ...form, living_place: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={save} className="btn-primary" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
                <button onClick={() => setEditing(false)} className="btn-ghost">Bekor qilish</button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-1 text-sm">
              {profile.bio && <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>}
              {profile.living_place && (
                <p className="flex items-center gap-1 text-gray-500"><MapPin className="h-4 w-4" /> {profile.living_place}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-6 px-1 text-lg font-bold">Postlar</h2>
      {posts.length === 0 ? (
        <div className="card py-8 text-center text-gray-400">Postlar yo'q</div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
