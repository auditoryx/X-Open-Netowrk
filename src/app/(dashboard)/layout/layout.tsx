'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebarToggle();

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
      <div className="flex-1 p-4 md:ml-64">{children}</div>
    </div>
  );
}
