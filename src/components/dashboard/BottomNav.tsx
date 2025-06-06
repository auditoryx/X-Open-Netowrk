'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Translate } from '@/i18n/Translate';

const links = [
  { href: '/dashboard/home', label: <Translate t="bottomnav.home" /> },
  { href: '/dashboard/messages', label: <Translate t="bottomnav.messages" /> },
  { href: '/dashboard/bookings', label: <Translate t="bottomnav.bookings" /> },
  { href: '/dashboard/profile', label: <Translate t="bottomnav.profile" /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 flex justify-around items-center bg-neutral-dark border-t border-neutral-800 py-2 z-30">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={
            pathname.startsWith(href)
              ? 'text-neutral-light font-semibold text-sm'
              : 'text-neutral-400 text-sm'
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
