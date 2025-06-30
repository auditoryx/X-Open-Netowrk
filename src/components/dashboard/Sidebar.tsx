'use client';

import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import SidebarItem from '@/components/ui/SidebarItem';
import { useAuth } from '@/lib/hooks/useAuth';
import { Translate } from '@/i18n/Translate';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { open: isOpen, toggle } = useSidebarToggle();
  const { userData } = useAuth();

  const links = [
    { href: '/dashboard/home', label: <Translate t="sidebar.dashboardHome" /> },
    { href: '/dashboard/bookings', label: <Translate t="sidebar.bookings" /> },
    { href: '/dashboard/messages', label: <Translate t="sidebar.messages" /> },
    { href: '/dashboard/availability', label: <Translate t="sidebar.availability" /> },
    { href: '/dashboard/earnings', label: <Translate t="sidebar.finances" /> },
    { href: '/dashboard/profile', label: <Translate t="sidebar.profile" /> },
    { href: '/dashboard/settings', label: <Translate t="sidebar.settings" /> },
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
