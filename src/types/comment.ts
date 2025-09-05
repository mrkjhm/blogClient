// types/comment.ts
export type CommentUser = {
  _id: string;
  name: string;
  //email?: string;
  avatarUrl?: string;
};

export type CommentNodeRaw = {
  _id: string;
  postId: string;
  user?: CommentUser;                // new DTO
  userId?: string | CommentUser;     // legacy
  comment: string;
  parentId: string | null;
  rootId?: string | null;
  depth?: number;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isEdited?: boolean;

  // 🔽 added for soft-delete support
  isDeleted?: boolean;               // if backend uses toDTO(isDeleted)
  deleted?: boolean;                 // if backend returns raw `deleted`
  deletedAt?: string;                // optional (admin/debug only)

  replies?: CommentNodeRaw[];
};

export type CommentNode = {
  _id: string;
  postId: string;
  user: CommentUser;                 // normalized
  comment: string;
  parentId: string | null;
  rootId: string | null;
  depth: number;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isEdited?: boolean;

  // 🔽 keep flag for UI logic
  isDeleted?: boolean;

  replies?: CommentNode[];
};

// Small normalizer (run once after fetch)
export function normalizeComment(n: CommentNodeRaw): CommentNode {
  const author =
    n.user ??
    (typeof n.userId === "object"
      ? n.userId
      : { _id: String(n.userId ?? ""), name: "Unknown" });

  // 🔽 unify the deleted flag (supports both shapes)
  const isDeleted = (n.isDeleted ?? (n as any).deleted) ?? false;

  return {
    _id: String(n._id),
    postId: String(n.postId),
    user: {
      _id: author._id,
      name: author.name ?? "Unknown",
      avatarUrl: author.avatarUrl,
    },
    // 🔽 ensure placeholder text if deleted (in case backend didn't swap)
    comment: isDeleted ? "This comment has been deleted" : n.comment,

    parentId: n.parentId ?? null,
    rootId: (n.rootId ?? null) as string | null,
    depth: (n.depth ?? 0) as number,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    editedAt: n.editedAt,
    isEdited: n.isEdited,

    isDeleted, // 🔽 used by UI to disable actions

    replies: n.replies?.map(normalizeComment),
  };
}


// export type CommentUser = {
//   _id: string;
//   name: string;
//   avatarUrl?: string;
// };

// export type CommentNode = {
//   _id: string;
//   postId: string;
//   user: CommentUser;           // <-- IMPORTANT: use `user`, not `userId`
//   comment: string;
//   parentId: string | null;
//   rootId: string | null;
//   depth: number;
//   createdAt: string;           // ISO string from backend
//   replies?: CommentNode[];
// };
