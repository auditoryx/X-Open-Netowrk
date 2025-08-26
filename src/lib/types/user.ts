export type UserRole = 'admin' | 'moderator' | 'creator' | 'user';
export interface BasicUser {
  uid?: string;
  email?: string | null;
  role?: UserRole;
  displayName?: string | null;
  photoURL?: string | null;
}

