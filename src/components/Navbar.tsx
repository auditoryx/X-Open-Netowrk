'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Translate } from '@/i18n/Translate';
import NotificationBell from '@/components/ui/NotificationBell';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  return (
    <nav className="bg-black px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-white border-b border-neutral-800">
      <Link href="/" className="flex items-center gap-2 md:gap-3 min-h-[2.75rem]">
        <Image
          src="/images/4BA64246-AF86-41DB-A924-7BA56CA99655_1_105_c.jpeg"
          alt="AuditoryX Logo"
          width={32}
          height={32}
          className="md:w-10 md:h-10 rounded-md object-contain"
        />
        <span className="font-bold text-lg md:text-2xl tracking-tight">AuditoryX</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6 text-sm items-center">
        <Link href="/explore" id="nav-explore" className="hover:underline font-medium text-brand-400 min-h-[2.75rem] flex items-center">
          <Translate t="nav.explore" />
        </Link>
        {!user && (
          <>
            <Link href="/apply" className="hover:underline text-gray-300 min-h-[2.75rem] flex items-center">
              <Translate t="nav.apply" />
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/login')}
                className="hover:underline text-gray-300 min-h-[2.75rem] px-2"
              >
                <Translate t="nav.login" />
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all min-h-[2.75rem]"
              >
                Get Started
              </button>
            </div>
          </>
        )}
        {user && (
          <>
            <Link href="/dashboard" id="nav-dashboard" className="hover:underline min-h-[2.75rem] flex items-center">
              <Translate t="nav.dashboard" />
            </Link>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="hover:underline text-red-400 min-h-[2.75rem] px-2"
            >
              <Translate t="nav.logout" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
        {!user && (
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-all text-sm min-h-[2.75rem]"
          >
            Sign In
          </button>
        )}
        {user && (
          <>
            <NotificationBell />
            <Link 
              href="/dashboard" 
              className="text-brand-400 hover:text-brand-300 transition-colors p-2 min-h-[2.75rem] flex items-center"
            >
              Dashboard
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
