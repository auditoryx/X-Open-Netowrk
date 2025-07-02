'use client';

import React, { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

interface RoleDashboardLayoutProps {
  children: ReactNode;
  role: string;
  userName?: string;
}

const roleConfig = {
  artist: {
    title: 'Artist Dashboard',
    icon: '🎤',
    color: 'from-pink-500 to-purple-600',
    quickActions: [
      { label: 'Edit Profile', href: '/dashboard/profile/edit', icon: '✏️' },
      { label: 'Add Availability', href: '/dashboard/availability', icon: '📅' },
      { label: 'Create Service', href: '/services/create', icon: '➕' },
      { label: 'View Analytics', href: '/dashboard/analytics', icon: '📊' }
    ]
  },
  producer: {
    title: 'Producer Dashboard',
    icon: '🎛️',
    color: 'from-blue-500 to-cyan-600',
    quickActions: [
      { label: 'Edit Profile', href: '/dashboard/profile/edit', icon: '✏️' },
      { label: 'Studio Schedule', href: '/dashboard/availability', icon: '🏠' },
      { label: 'New Beat', href: '/services/create', icon: '🎵' },
      { label: 'Client Reviews', href: '/dashboard/reviews', icon: '⭐' }
    ]
  },
  studio: {
    title: 'Studio Dashboard',
    icon: '🏢',
    color: 'from-green-500 to-emerald-600',
    quickActions: [
      { label: 'Studio Info', href: '/dashboard/profile/edit', icon: '🏢' },
      { label: 'Room Booking', href: '/dashboard/availability', icon: '🗓️' },
      { label: 'Equipment List', href: '/services/create', icon: '🎛️' },
      { label: 'Booking History', href: '/dashboard/bookings', icon: '📋' }
    ]
  },
  videographer: {
    title: 'Videographer Dashboard',
    icon: '🎥',
    color: 'from-red-500 to-orange-600',
    quickActions: [
      { label: 'Portfolio', href: '/dashboard/profile/edit', icon: '🎬' },
      { label: 'Shoot Schedule', href: '/dashboard/availability', icon: '📅' },
      { label: 'New Package', href: '/services/create', icon: '📦' },
      { label: 'Past Projects', href: '/dashboard/projects', icon: '🎞️' }
    ]
  }
};

export default function RoleDashboardLayout({ children, role, userName }: RoleDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.artist;

  const navigationItems = [
    { label: 'Overview', href: `/dashboard/${role}`, icon: '🏠' },
    { label: 'Bookings', href: `/dashboard/bookings`, icon: '📅' },
    { label: 'Messages', href: `/dashboard/messages`, icon: '💬' },
    { label: 'Services', href: `/dashboard/services`, icon: '🛍️' },
    { label: 'Earnings', href: `/dashboard/earnings`, icon: '💰' },
    { label: 'Settings', href: `/dashboard/settings`, icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className={`bg-gradient-to-r ${config.color} px-6 py-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-white/80 text-sm">
                Welcome back, {userName || user?.displayName || 'Creator'}!
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {config.quickActions.slice(0, 3).map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href === `/dashboard/${role}` && pathname === `/dashboard/${role}`);
              
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Additional Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {config.quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
