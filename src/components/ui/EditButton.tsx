"use client";
import { useState } from "react";
import { toast } from "sonner"; // ✅ import toast

type Props = {
  commentId: string;
  initial: string;
  onDone?: () => void;
  visible?: boolean; // show only for owner/admin
  onStateChange?: (isOpen: boolean) => void;
  isOpen?: boolean;
};

export default function EditButton({
  commentId,
  initial,
  onDone,
  visible,
  onStateChange,
  isOpen = false,
}: Props) {
  const [text, setText] = useState(initial);
  const [loading, setLoading] = useState(false);
  // const token = localStorage.getItem("accessToken");

  // Notify parent when state changes
  const handleStateChange = (newState: boolean) => {
    onStateChange?.(newState);
  };

  if (!visible) return null;

  async function save() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: text.trim() }),
        }
      );

      let payload: any = null;
      try {
        payload = await r.json();
      } catch {
        /* ignore */
      }

      if (!r.ok) {
        throw new Error(payload?.message || "Edit failed");
      }

      toast.success("Comment updated successfully");

      handleStateChange(false); // Close the edit form
      onDone?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to edit comment ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline">
      {!isOpen ? (
        <button
          className="cursor-pointer text-primary underline hover:underline-offset-4 text-sm"
          onClick={() => handleStateChange(true)}
        >
          Edit
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
              onClick={save}
              disabled={loading || !text.trim()}
              className="bg-black text-white text-xs px-3 py-1 rounded disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => {
                handleStateChange(false);
                setText(initial);
              }}
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
