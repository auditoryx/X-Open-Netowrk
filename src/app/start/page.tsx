'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

const MOCK_CREATORS = [
  { name: 'DJ Hikari', role: 'Producer', location: 'Tokyo', img: '/placeholder1.jpg' },
  { name: 'Nova Joon', role: 'Videographer', location: 'Seoul', img: '/placeholder2.jpg' },
  { name: 'Zayne', role: 'Engineer', location: 'Los Angeles', img: '/placeholder3.jpg' },
];

export default function StartPage() {
  const router = useRouter();
  const session = useSession();
  const sessionData = session?.data;

  const handleJoin = () => {
    if (sessionData?.user) {
      router.push('/create-profile');
    } else {
      router.push('/signup?redirect=/create-profile');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Get Discovered. Get Booked. Get Paid.
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          AuditoryX connects artists, producers, engineers, and videographers across the globe.
        </p>
        <button
          onClick={handleJoin}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Join as a Creator
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {MOCK_CREATORS.map((c, i) => (
          <div key={i} className="bg-neutral-900 rounded-xl p-4 text-left">
            <div className="h-40 bg-neutral-800 rounded mb-4" />
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p className="text-sm text-gray-400">{c.role} • {c.location}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mt-12">
        Already have a profile? <span className="underline cursor-pointer" onClick={() => router.push('/dashboard')}>Go to Dashboard</span>
      </p>
    </div>
  );
}
