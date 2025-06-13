'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Translate } from '@/i18n/Translate';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  return (
    <nav className="bg-black px-6 py-4 flex items-center justify-between text-white border-b border-neutral-800">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/4BA64246-AF86-41DB-A924-7BA56CA99655_1_105_c.jpeg"
          alt="AuditoryX Logo"
          width={40}
          height={40}
          loading="lazy"
          className="rounded-md object-contain"
        />
        <span className="font-bold text-2xl tracking-tight">AuditoryX</span>
      </Link>

      <div className="space-x-6 text-sm flex items-center">
        <Link href="/explore" id="nav-explore" className="hover:underline">
          <Translate t="nav.explore" />
        </Link>
        {!user && (
          <>
            <Link href="/apply" className="hover:underline">
              <Translate t="nav.apply" />
            </Link>
            <button
              onClick={() => router.push('/login')}
              className="hover:underline font-semibold text-blue-400"
            >
              <Translate t="nav.login" />
            </button>
          </>
        )}
        {user && (
          <>
            <Link href="/dashboard" id="nav-dashboard" className="hover:underline">
              <Translate t="nav.dashboard" />
            </Link>
            <button
              onClick={handleLogout}
              className="hover:underline text-red-400"
            >
              <Translate t="nav.logout" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
