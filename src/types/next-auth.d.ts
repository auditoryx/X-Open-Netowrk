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
    accessToken?: string;
    refreshToken?: string;
  }

  interface User {
    id: string;
    uid: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}
