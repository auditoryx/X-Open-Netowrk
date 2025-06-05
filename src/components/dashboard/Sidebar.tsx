'use client';

import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import SidebarItem from '@/components/ui/SidebarItem';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { open: isOpen, toggle } = useSidebarToggle();
  const { userData } = useAuth();
  const isCreator = userData?.role && userData.role !== 'user';

  const links = [
    { href: '/dashboard/home', label: 'Dashboard Home' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/dashboard/messages', label: 'Messages' },
    { href: '/dashboard/availability', label: 'Availability' },
    { href: '/dashboard/earnings', label: 'Finances' },
    { href: '/dashboard/profile', label: 'Profile' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggle}
        className="sm:hidden fixed top-4 left-4 z-50 bg-black text-white p-2 rounded-md"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`sm:block fixed top-0 left-0 h-full w-64 bg-white border-r p-6 space-y-4 text-black transition-transform z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}
      >
        <h2 className="text-xl font-bold mb-4">AuditoryX</h2>
        <nav aria-label="Dashboard navigation">
          <ul className="space-y-2">
            {links.map(({ href, label }) => (
              <li key={href} onClick={onClose}>
                <SidebarItem href={href} label={label} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
