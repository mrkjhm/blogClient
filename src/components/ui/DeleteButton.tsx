"use client";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  commentId: string;
  onDone?: () => void;
  visible?: boolean;
};

export default function DeleteButton({
  commentId,
  onDone,
  visible = true,
}: Props) {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accessToken")

  if (!visible) return null;

  const onDelete = async () => {
    try {
      setLoading(true);
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let payload: any = null;
      try {
        payload = await r.json();
      } catch {
        /* ignore */
      }

      if (!r.ok) {
        throw new Error(payload?.message || "Delete failed");
      }

      toast.success("Comment deleted successfully");
      onDone?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete comment");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    toast.custom((deletecomment) => (
      <div className="bg-white p-4 rounded shadow text-sm flex flex-col gap-3">
        <p>Are you sure you want to delete this comment?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(deletecomment)} className="px-3 py-1 text-xs rounded border">Cancel</button>
          <button onClick={onDelete} className="px-3 py-1 text-xs rounded bg-red-600 text-white">Delete</button>
        </div>
      </div>
    ))
  }
  return (
    <button
      onClick={confirmDelete}
      disabled={loading}
      className="cursor-pointer text-red-600 underline hover:underline-offset-4 text-sm disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
