'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black px-6 py-4 flex items-center justify-between text-white border-b border-neutral-800">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/4BA64246-AF86-41DB-A924-7BA56CA99655_1_105_c.jpeg"
          alt="AuditoryX Logo"
          width={40}
          height={40}
          className="rounded-md object-contain"
        />
        <span className="font-bold text-2xl tracking-tight">AuditoryX</span>
      </Link>

      <div className="space-x-6 text-sm">
        <Link href="/explore" className="hover:underline">Explore</Link>
        {session?.user ? (
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        ) : (
          <Link href="/start" className="hover:underline font-semibold text-blue-400">
            Join as a Creator
          </Link>
        )}
        <Link href="/apply" className="hover:underline">Apply</Link>
      </div>
    </nav>
  );
}
