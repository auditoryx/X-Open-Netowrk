// src/types/next-auth.d.ts

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      uid: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    uid: string;
  }
}
