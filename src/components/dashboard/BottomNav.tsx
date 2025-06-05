'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard/home', label: 'Home' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 flex justify-around items-center bg-neutral-900 border-t border-neutral-800 py-2 z-30">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={
            pathname.startsWith(href)
              ? 'text-white font-semibold text-sm'
              : 'text-neutral-400 text-sm'
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
