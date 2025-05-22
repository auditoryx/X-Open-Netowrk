'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`block w-full px-4 py-2 rounded font-medium transition ${isActive
          ? 'bg-black text-white'
          : 'hover:bg-gray-100 text-gray-800'}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {label}
      </Link>
    </li>
  );
}
