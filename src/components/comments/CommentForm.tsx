"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useUser } from "../../../contexts/UserContext";

type Props = {
  postId: string;
  onAdded?: () => void; // call to refetch or update UI
};

export default function CommentForm({ postId, onAdded }: Props) {

  const router = useRouter();
  const { user } = useUser();


  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast("You need to login to comment", {
        action: {
          label: "Login",
          onClick: () => router.push("/login")
        }
      })
    }

    if (!comment.trim()) return;

    let token = localStorage.getItem("accessToken");

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${postId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });

      // if (res.status === 401 || res.status === 403) {
      //   toast.error("Unauthorized. Please login again")
      // }
      if (!res.ok) console.log("Failed to add comment");
      setComment("");
      onAdded?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 max-w-4xl mx-auto py-8 prose prose-lg">
      <h1 className="font-bold">Comments</h1>
      <textarea
        className="w-full border rounded-md p-2 text-sm"
        rows={3}
        placeholder="Write a comment…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        disabled={loading || !comment.trim()}
        className="bg-black text-white text-sm px-3 py-2 rounded-md disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
