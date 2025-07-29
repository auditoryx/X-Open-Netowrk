'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  User, 
  Settings, 
  DollarSign,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
}

const navigation: NavItem[] = [
  {
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    label: 'Home',
    tooltip: 'Dashboard Home'
  },
  {
    href: '/dashboard/bookings',
    icon: <Calendar className="w-5 h-5" />,
    label: 'Bookings',
    tooltip: 'My Bookings'
  },
  {
    href: '/dashboard/messages',
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Messages',
    tooltip: 'Conversations'
  },
  {
    href: '/dashboard/collabs',
    icon: <Users className="w-5 h-5" />,
    label: 'Collabs',
    tooltip: 'Collaborations'
  },
  {
    href: '/dashboard/availability',
    icon: <Clock className="w-5 h-5" />,
    label: 'Schedule',
    tooltip: 'Availability'
  },
  {
    href: '/dashboard/earnings',
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Earnings',
    tooltip: 'Finances'
  },
  {
    href: '/dashboard/profile',
    icon: <User className="w-5 h-5" />,
    label: 'Profile',
    tooltip: 'Profile Settings'
  },
  {
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings',
    tooltip: 'Account Settings'
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/home';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`
        sticky top-0 h-screen bg-neutral-900 border-r border-white/10 
        transition-all duration-300 flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="text-xl font-bold text-white">
              AuditoryX
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    group relative
                    ${isActive(item.href) 
                      ? 'bg-brand-600 text-white' 
                      : 'text-gray-300 hover:bg-neutral-800 hover:text-white'
                    }
                  `}
                  title={collapsed ? item.tooltip : ''}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="
                      absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm 
                      rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none whitespace-nowrap z-50
                    ">
                      {item.tooltip}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {!collapsed ? (
            <div className="text-xs text-gray-400">
              <p>© 2024 AuditoryX</p>
              <p>Dashboard v2.0</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full"></div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}