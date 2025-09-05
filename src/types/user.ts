export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}