'use client';

import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import SidebarItem from '@/components/ui/SidebarItem';

const links = [
  { href: '/dashboard', label: 'Dashboard Home' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function Sidebar() {
  const { isOpen, toggle } = useSidebarToggle();

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
              <SidebarItem key={href} href={href} label={label} />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
