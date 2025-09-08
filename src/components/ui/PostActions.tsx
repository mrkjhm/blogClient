"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { Post } from "@/types/post";

import { useUser } from "../../../contexts/UserContext";

type Props = {
  post: Post;
  className?: string;
  showEdit?: boolean;              // toggle Edit button
  onDeleted?: () => void;          // optional callback after delete
  onUpdated?: (updatedPost: Post) => void; // callback after successful update
};

export default function PostActions({ post, className, showEdit = true, onDeleted, onUpdated }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // More robust check for canModify
  const canModify = !!user && (
    user.isAdmin ||
    (typeof post.author === 'object' && user._id === post.author._id) ||
    (typeof post.author === 'string' && user._id === post.author)
  );

  // Debug logging
  console.log('PostActions Debug:', {
    user: user ? { id: user._id, isAdmin: user.isAdmin } : null,
    postAuthor: post.author,
    canModify
  });

  if (!canModify) return null;

  const onDelete = async () => {

    const token = localStorage.getItem("accessToken")

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Delete failed");

      toast.success("Post deleted");
      onDeleted?.();
      // Common flow: go back to listing
      router.push("/posts");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  async function confirmDelete() {
    toast.custom((deletepost) => (
      <div className="bg-white p-4 rounded shadow text-sm flex flex-col gap-3">
        <p>Are you sure you want to delete this post?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(deletepost)} className="px-3 py-1 text-xs rounded border">Cancel</button>
          <button onClick={onDelete} className="px-3 py-1 text-xs rounded bg-red-600 text-white">Delete</button>
        </div>
      </div>
    ));
  }

  return (
    <div className={`flex gap-3 ${className || ""}`}>
      <button
        onClick={confirmDelete}
        className="px-3 py-1 text-sm rounded border border-red-300 text-red-600  disabled:opacity-50 cursor-pointer"
        disabled={loading}
        aria-label={`Delete post: ${post.title}`}
      >
        {loading ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
