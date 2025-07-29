'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  BookmarkIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  TrophyIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  requiresRole?: string[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon
    },
    {
      id: 'bookings',
      label: 'Bookings',
      href: '/dashboard/bookings',
      icon: CalendarIcon,
      badge: 3
    },
    {
      id: 'messages',
      label: 'Messages',
      href: '/dashboard/messages',
      icon: ChatBubbleLeftRightIcon,
      badge: 5
    },
    {
      id: 'services',
      label: 'Services',
      href: '/dashboard/services',
      icon: ClipboardDocumentListIcon,
      requiresRole: ['provider', 'artist', 'producer', 'engineer']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: ChartBarIcon,
      requiresRole: ['provider']
    },
    {
      id: 'earnings',
      label: 'Earnings',
      href: '/dashboard/earnings',
      icon: CurrencyDollarIcon,
      requiresRole: ['provider']
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon
    },
    {
      id: 'reviews',
      label: 'Reviews',
      href: '/dashboard/reviews',
      icon: StarIcon
    },
    {
      id: 'favorites',
      label: 'Favorites',
      href: '/dashboard/favorites',
      icon: BookmarkIcon
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: BellIcon
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      href: '/dashboard/leaderboard',
      icon: TrophyIcon
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon
    }
  ];

  const filteredItems = sidebarItems.filter(item => {
    if (!item.requiresRole) return true;
    return item.requiresRole.includes(userData?.role || '');
  });

  const handleItemClick = (href: string) => {
    router.push(href);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brutalist-black">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-brutalist-dark border-r-4 border-white
          transform transition-transform duration-300 ease-in-out
          ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
        initial={false}
        animate={{ x: isMobile && !isSidebarOpen ? -256 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b-2 border-white">
            <div className="flex items-center justify-between">
              <h2 className="font-brutalist text-xl text-white font-black uppercase">
                Dashboard
              </h2>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {/* User Info */}
            <div className="mt-4 p-3 bg-gray-800 border-2 border-gray-600">
              <p className="text-white font-brutalist-mono text-sm font-semibold">
                {userData?.displayName || 'User'}
              </p>
              <p className="text-gray-400 font-brutalist-mono text-xs uppercase">
                {userData?.role || 'Member'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-4">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.href)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-none border-2 transition-all
                        font-brutalist-mono text-sm font-medium
                        ${isActive 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent text-white border-gray-600 hover:border-white hover:bg-gray-800'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <motion.span
                          className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-white">
            <button
              onClick={() => router.push('/explore')}
              className="w-full btn-brutalist-secondary text-sm"
            >
              🔍 Explore Network
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-brutalist-dark border-b-2 border-white p-4 md:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-white hover:text-gray-300"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <h1 className="font-brutalist text-lg text-white font-black uppercase">
                Dashboard
              </h1>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}