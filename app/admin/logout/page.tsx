"use client";

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function AdminLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await signOut(auth);
      router.push("/auth");
    };
    logout();
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Logging you out...</p>
    </main>
  );
}
