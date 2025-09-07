// src/components/comments/CommentsSection.tsx
"use client";
import CommentForm from "@/components/comments/CommentForm";
import { useComments } from "@/hooks/useComments";

import CommentsTree from "./CommentTree";

export default function CommentsSection({ postId }: { postId: string }) {
  const { nodes, loading, error, refresh } = useComments(postId);

  return (
    <section className="max-w-4xl mx-auto">
      <CommentForm postId={postId} onAdded={refresh} />
      {loading && <p className="text-sm text-gray-500">Loading comments…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <CommentsTree nodes={nodes} postId={postId} onChanged={refresh} />
    </section>
  );
}
