'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SidebarItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const active = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded transition',
        active
          ? 'bg-white text-black font-semibold'
          : 'text-white hover:bg-white/10'
      )}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}
