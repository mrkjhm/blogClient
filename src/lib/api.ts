// src/lib/api.ts
import type { CommentNode } from "@/types/comment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Make a tiny wrapper so all fetchers share error handling
async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function safeMessage(res: Response) {
  try {
    const data = await res.json();
    return (data as any)?.message ?? (data as any)?.error?.message;
  } catch {
    return null;
  }
}

// --- COMMENTS API ---
export async function fetchComments(postId: string): Promise<CommentNode[]> {
  return getJSON<CommentNode[]>(`/api/comments/${postId}/tree`);
}

export async function addComment(postId: string, comment: string, token?: string) {
  return getJSON<{ message: string }>(`/api/comments/${postId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ comment: comment.trim() }),
  });
}

export async function addReply(postId: string, parentId: string, comment: string, token?: string) {
  return getJSON<{ message: string }>(`/api/comments/${postId}/replies/${parentId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ comment: comment.trim(), parentId }),
  });
}

// You can add more here: updateComment, deleteComment, fetchPost, fetchPosts, etc.
