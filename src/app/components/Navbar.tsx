'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-black p-4 flex justify-between text-white">
      <div className="font-bold text-2xl">
        <Link href="/">AuditoryX</Link>
      </div>
      <div className="space-x-6">
        <Link href="/explore">Explore</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}
