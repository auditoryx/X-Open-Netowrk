"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "@/lib/getUserProfile";

export default function ArtistDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <main className="min-h-screen bg-black text-white p-10">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Welcome, {user.name || "Artist"} 👋</h1>
      <p className="text-gray-400">Role: {user.role}</p>
      <p className="mt-4">This is your artist dashboard. More features coming soon!</p>
    </main>
  );
}
