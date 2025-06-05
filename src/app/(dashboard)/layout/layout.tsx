'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import ReviewPrompt from '@/components/dashboard/ReviewPrompt';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open: isSidebarOpen, toggle: toggleSidebar } = useSidebarToggle();
  const { userData } = useAuth();
  const isCreator = userData?.role && userData.role !== 'user';
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <div
        className={`fixed md:static z-20 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } w-64`}
      >
        <Sidebar onClose={toggleSidebar} />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-16 md:ml-64">
        {isCreator && (
          <div className="mb-4 flex gap-2">
            <Link
              href="/dashboard/bookings"
              className={`px-3 py-1 rounded text-sm ${pathname.startsWith('/dashboard/bookings') ? 'bg-white text-black' : 'bg-neutral-800 text-white'}`}
            >
              I’m Selling
            </Link>
            <Link
              href="/dashboard/purchases"
              className={`px-3 py-1 rounded text-sm ${pathname.startsWith('/dashboard/purchases') ? 'bg-white text-black' : 'bg-neutral-800 text-white'}`}
            >
              I’m Buying
            </Link>
          </div>
        )}
        {children}
        <ReviewPrompt />
      </div>
      <BottomNav />
    </div>
  );
}
