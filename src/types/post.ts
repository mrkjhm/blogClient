import { CommentNode } from "./comment";

export interface Post {
  _id: string;
  slug: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | string; // Can be either populated object or ObjectId string
  title: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  content: string;
  comments: string[]; // use string IDs instead of ObjectId
  createdAt: string; // usually serialized to string from backend
  updatedAt?: string; // optional field for tracking modifications
  category: string
  avatarUrl: string
  commentsTree?: CommentNode[];
}
