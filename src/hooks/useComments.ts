// src/hooks/useComments.ts
"use client";
import { useCallback, useEffect, useState } from "react";

import { fetchComments } from "@/lib/api";
import type { CommentNode } from "@/types/comment";

import { useUser } from "../../contexts/UserContext";

export function useComments(postId: string) {
  const { user } = useUser();
  const [nodes, setNodes] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchComments(postId);
      setNodes(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // initial + re-fetch on login/logout (so ownership buttons update)
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { refresh(); }, [user?._id, refresh]);

  return { nodes, loading, error, refresh, setNodes };
}
