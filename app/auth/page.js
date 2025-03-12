"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {session ? (
        <>
          <h1 className="text-2xl font-bold">Welcome, {session.user.name}!</h1>
          <button onClick={() => signOut()} className="bg-red-600 px-4 py-2 mt-4">Sign Out</button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Login</h1>
          <button onClick={() => signIn("credentials")} className="bg-blue-600 px-4 py-2 mt-4">Sign In</button>
        </>
      )}
    </div>
  );
}
