'use client';

import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard Home' },
  { href: '/dashboard/settings', label: 'Settings' },
  // Add more routes here later
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r p-6 space-y-4 text-black">
      <h2 className="text-xl font-bold mb-4">AuditoryX</h2>

      <nav aria-label="Main dashboard navigation">
        <ul className="space-y-2">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block w-full px-4 py-2 rounded font-medium transition ${
                    isActive
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
// Usage example
// <Sidebar />
// <Sidebar />
// <Sidebar />