"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MessageSquare, Repeat2, Send } from "lucide-react";
import { api } from "@/lib/api";
import Avatar from "./Avatar";

function timeAgo(date) {
  const d = (Date.now() - new Date(date)) / 1000;
  if (d < 60) return "hozir";
  if (d < 3600) return `${Math.floor(d / 60)} daq oldin`;
  if (d < 86400) return `${Math.floor(d / 3600)} soat oldin`;
  if (d < 604800) return `${Math.floor(d / 86400)} kun oldin`;
  return new Date(date).toLocaleDateString("uz");
}

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likes, setLikes] = useState(post.likes_count);
  const [comments, setComments] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [count, setCount] = useState(post.comments_count);
  const [commentText, setCommentText] = useState("");

  async function toggleLike() {
    const res = await api.post(`/api/posts/${post.id}/like/`, {});
    setLiked(res.liked);
    setLikes(res.likes_count);
  }

  async function loadComments() {
    if (!showComments && comments === null) {
      const data = await api.get(`/api/posts/${post.id}/comments/`);
      setComments(data);
    }
    setShowComments(!showComments);
  }

  async function addComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const c = await api.post(`/api/posts/${post.id}/comments/`, { text: commentText });
    setComments((cs) => [...(cs || []), c]);
    setCount((n) => n + 1);
    setCommentText("");
  }

  const author = post.author_detail || {};

  return (
    <article className="card mb-4 p-0">
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar user={author} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${author.id}`} className="font-semibold hover:underline">
            {author.full_name}
          </Link>
          <div className="text-xs text-gray-400">{timeAgo(post.created_at)}</div>
        </div>
      </div>

      {post.text && (
        <p className="whitespace-pre-wrap px-4 pb-3 text-[15px] leading-relaxed">
          {post.text}
        </p>
      )}
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="max-h-[28rem] w-full object-cover" />
      )}

      <div className="flex items-center gap-1 border-t border-gray-100 px-2 py-1.5 dark:border-gray-800">
        <button
          onClick={toggleLike}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
            liked ? "text-rose-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-rose-500" : ""}`} />
          {likes > 0 && likes}
        </button>
        <button
          onClick={loadComments}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <MessageSquare className="h-5 w-5" />
          {count > 0 && count}
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          <Repeat2 className="h-5 w-5" />
        </button>
      </div>

      {showComments && (
        <div className="space-y-2 border-t border-gray-100 p-4 dark:border-gray-800">
          {(comments || []).map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar user={c.author_detail} size={32} />
              <div className="rounded-2xl bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                <span className="font-semibold">{c.author_detail?.full_name}</span>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={addComment} className="flex items-center gap-2 pt-1">
            <input
              className="input"
              placeholder="Izoh yozing..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn-primary !px-3" aria-label="Yuborish">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
