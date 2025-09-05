"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommentNode } from "@/types/comment";

import { useUser } from "../../../contexts/UserContext";
import Container from "../ui/Container";
import DeleteButton from "../ui/DeleteButton";
import EditButton from "../ui/EditButton";
import ReplyButton from "../ui/ReplyButton";

type Props = {
  nodes: CommentNode[];
  postId: string;
  onChanged: () => void;
  onReplyOpen?: (isOpen: boolean) => void;
  onEditOpen?: (isOpen: boolean) => void;
};

function CommentItem({
  node,
  postId,
  onChanged,
  openFormId,
  setOpenFormId,
}: {
  node: CommentNode;
  postId: string;
  onChanged: () => void;
  openFormId: string | null;
  setOpenFormId: (id: string | null) => void;
}) {
  const { user: me } = useUser();

  // Prefer the normalized shape (node.user). Keep legacy fallback, just in case.
  function getAuthor(n: any) {
    if (n.user) return n.user;                         // normalized DTO
    if (n.userId && typeof n.userId === "object")      // legacy populated
      return n.userId;
    return { _id: "", name: "Unknown" };
  }

  const author = getAuthor(node);
  const avatarSrc = author?.avatarUrl ?? "";
  const displayName = author?.name ?? "Unknown";

  const isDeleted = !!node.isDeleted; // <-- key flag for UI logic
  const canModify =
    !!me && !!author && me._id === author._id && !isDeleted;

  const isReplyOpen = openFormId === `${node._id}-reply`;
  const isEditOpen = openFormId === `${node._id}-edit`;

  const [showReplies, setShowReplies] = useState(false);

  return (
    <li className="space-y-2 max-w-4xl mx-auto">
      {/* content */}
      <div className="prose prose-lg">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback>
              {(displayName?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="font-medium text-gray-900 capitalize">{displayName}</span>
              <span>• {new Date(node.createdAt).toLocaleString()}</span>
              {isDeleted && (
                <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                  deleted
                </span>
              )}
            </div>

            <p
              className={`text-sm mt-1 ${isDeleted ? "italic text-gray-500" : ""
                }`}
            >
              {node.comment}
              {!isDeleted && node.isEdited && (
                <span className="text-xs text-gray-400 ml-2">
                  edited {new Date(node.editedAt ?? "").toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* actions (keep outside .prose) */}
      <div className="not-prose flex gap-5">
        {/* Reply hidden when deleted OR when edit form is open */}
        {!isDeleted && !isEditOpen && (
          <ReplyButton
            postId={postId}
            parentId={node._id}
            onDone={onChanged}
            onStateChange={(isOpen) =>
              setOpenFormId(isOpen ? `${node._id}-reply` : null)
            }
            isOpen={isReplyOpen}
          />
        )}

        {/* Edit/Delete only if owner (or your internal canModify logic) and not deleted and reply not open */}
        {canModify && !isReplyOpen && !isDeleted && (
          <>
            <EditButton
              commentId={node._id}
              initial={node.comment}
              visible={true}
              onDone={onChanged}
              onStateChange={(isOpen) =>
                setOpenFormId(isOpen ? `${node._id}-edit` : null)
              }
              isOpen={isEditOpen}
            />
            {!isEditOpen && (
              <DeleteButton
                commentId={node._id}
                visible={true}
                onDone={onChanged}
              />
            )}
          </>
        )}

        {/* toggle replies */}
        {node.replies && node.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-gray-500 underline"
          >
            {showReplies
              ? `Hide ${node.replies.length} repl${node.replies.length > 1 ? "ies" : "y"
              }`
              : `Show ${node.replies.length} repl${node.replies.length > 1 ? "ies" : "y"
              }`}
          </button>
        )}
      </div>

      {/* replies */}
      {showReplies && node.replies?.length ? (
        <ul className="mt-2 ml-6 border-l pl-4 space-y-4">
          {node.replies.map((child) => (
            <CommentItem
              key={child._id}
              node={child}
              postId={postId}
              onChanged={onChanged}
              openFormId={openFormId}
              setOpenFormId={setOpenFormId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function CommentsTree({ nodes, postId, onChanged }: Props) {
  const [openFormId, setOpenFormId] = useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <Container>
        <p className="text-sm text-gray-500 space-y-2 max-w-4xl mx-auto">
          No comments yet.
        </p>
      </Container>
    );
  }

  // newest-first at top level; child sorting handled server- or insert-order
  const sortedNodes = [...nodes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <ul className="space-y-6">
        {sortedNodes.map((n) => (
          <CommentItem
            key={n._id}
            node={n}
            postId={postId}
            onChanged={onChanged}
            openFormId={openFormId}
            setOpenFormId={setOpenFormId}
          />
        ))}
      </ul>

    </>
  );
}
