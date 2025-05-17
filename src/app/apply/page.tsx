'use client';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function ApplyPage() {
  const roles = [
    { label: 'Artist', value: 'artist' },
    { label: 'Producer', value: 'producer' },
    { label: 'Engineer', value: 'engineer' },
    { label: 'Videographer', value: 'videographer' },
    { label: 'Studio', value: 'studio' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold mb-4 text-center">Apply to AuditoryX</h1>
        <p className="text-lg text-gray-400 mb-10 text-center">
          Choose your creator role to begin your application.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link
              key={role.value}
              href={`/apply/${role.value}`}
              className="border border-neutral-700 rounded-xl p-6 hover:border-white/70 transition"
            >
              <h2 className="text-xl font-semibold">{role.label}</h2>
              <p className="text-sm text-gray-400 mt-2">
                Apply as a {role.label.toLowerCase()} to list services and get booked.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
