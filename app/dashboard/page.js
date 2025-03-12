"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-4xl font-bold">Welcome, {session.user.name}</h1>
      <p className="mt-2 text-gray-400">Manage your profile, availability, and bookings here.</p>
    </div>
  );
}
