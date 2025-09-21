"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useUser } from "../../../contexts/UserContext";

type Props = {
  postId: string;
  parentId: string;
  onDone?: () => void;
  onStateChange?: (open: boolean) => void;
  isOpen?: boolean;
};

export default function ReplyButton({
  postId,
  parentId,
  onDone,
  onStateChange,
  isOpen = false,
}: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Fallback local state if parent doesn't control it
  const [openLocal, setOpenLocal] = useState(isOpen);
  const open = onStateChange ? isOpen : openLocal;
  const setOpen = onStateChange ?? setOpenLocal;

  const { user } = useUser();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const submit = async () => {
    if (!text.trim()) return;
    if (!user) {
      toast.error("Please log in to reply");
      return;
    }
    if (!API_URL) {
      toast.error("API URL not configured");
      return;
    }

    try {
      setLoading(true);

      // If your backend expects a different route/body, adjust here.
      // Example keeps: POST /api/comments/:postId/replies/:parentId  with { comment, parentId }
      const res = await fetch(
        `${API_URL}/api/comments/${postId}/replies/${parentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: text.trim(), parentId }),
        }
      );

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        // ignore parse error if no JSON body
      }

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please login again.");
        return;
      }
      if (!res.ok) {
        throw new Error(payload?.message || "Reply failed");
      }

      setText("");
      setOpen(false);
      onDone?.();
      toast.success("Reply posted!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Reply failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        disabled
        className="bg-gray-300 text-xs px-3 py-1 rounded opacity-50 cursor-not-allowed"
        title="Please log in to reply"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="inline">
      {!open ? (
        <button
          className="cursor-pointer text-primary underline hover:underline-offset-4 text-sm"
          onClick={() => setOpen(true)}
        >
          Reply
        </button>
      ) : (
        <div className="mt-2 space-y-2">
          <textarea
            className="w-full border rounded-md p-2 text-sm"
            rows={3}
            cols={100}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={loading || !text.trim()}
              className="bg-black text-white text-xs px-3 py-1 rounded disabled:opacity-50"
            >
              {loading ? "Posting…" : "Reply"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs px-3 py-1 rounded border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
