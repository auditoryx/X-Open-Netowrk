'use client'

import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard Home' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  return (
    <aside className="w-64 h-screen bg-white border-r p-6 space-y-4">
      <h2 className="text-lg font-bold">AuditoryX</h2>
      <nav>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`block px-4 py-2 rounded ${
                  pathname === link.href ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
