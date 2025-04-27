'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-4">
      <h1 className="text-5xl font-bold mb-6">Welcome to AuditoryX</h1>
      <p className="text-lg mb-10">Manage, explore, and elevate your creative services.</p>
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/explore')}
          className="border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
        >
          Explore Services
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
        >
          My Dashboard
        </button>
      </div>
    </div>
  );
}
