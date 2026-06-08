"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { Avatar } from "./Navbar";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likes, setLikes] = useState(post.likes_count);
  const [comments, setComments] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  async function toggleLike() {
    const res = await api.post(`/api/posts/${post.id}/like/`, {});
    setLiked(res.liked);
    setLikes(res.likes_count);
  }

  async function loadComments() {
    if (!showComments) {
      const data = await api.get(`/api/posts/${post.id}/comments/`);
      setComments(data);
    }
    setShowComments(!showComments);
  }

  async function addComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const c = await api.post(`/api/posts/${post.id}/comments/`, {
      text: commentText,
    });
    setComments((cs) => [...(cs || []), c]);
    setCommentText("");
  }

  const author = post.author_detail || {};

  return (
    <div className="card mb-4">
      <div className="mb-3 flex items-center gap-3">
        <Avatar user={author} />
        <div>
          <Link href={`/profile/${author.id}`} className="font-semibold hover:underline">
            {author.full_name}
          </Link>
          <div className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleString("uz")}
          </div>
        </div>
      </div>

      {post.text && <p className="mb-3 whitespace-pre-wrap">{post.text}</p>}
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="mb-3 max-h-96 w-full rounded-lg object-cover" />
      )}

      <div className="flex items-center gap-4 border-t border-gray-100 pt-2 text-sm dark:border-gray-800">
        <button onClick={toggleLike} className={liked ? "text-brand" : "text-gray-500"}>
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={loadComments} className="text-gray-500">
          💬 {post.comments_count}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2">
          {(comments || []).map((c) => (
            <div key={c.id} className="rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-800">
              <span className="font-medium">{c.author_detail?.full_name}: </span>
              {c.text}
            </div>
          ))}
          <form onSubmit={addComment} className="flex gap-2">
            <input
              className="input"
              placeholder="Komment yozing..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn-primary">Yuborish</button>
          </form>
        </div>
      )}
    </div>
  );
}
