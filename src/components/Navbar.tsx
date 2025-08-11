'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Translate } from '@/i18n/Translate';
import NotificationBell from '@/components/ui/NotificationBell';
import AnimatedNav from '@/components/navigation/AnimatedNav';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  // Enhanced navigation items
  const mainNavItems = [
    { label: 'Explore', href: '/explore', isActive: pathname === '/explore' },
    { label: 'About', href: '/about', isActive: pathname === '/about' },
    { label: 'Contact', href: '/contact', isActive: pathname === '/contact' },
  ];

  const userNavItems = user ? [
    { label: 'Dashboard', href: '/dashboard', isActive: pathname.startsWith('/dashboard') },
    { label: 'Bookings', href: '/dashboard/bookings', isActive: pathname === '/dashboard/bookings' },
    { label: 'Messages', href: '/dashboard/messages', isActive: pathname === '/dashboard/messages' },
    { label: 'Profile', href: '/profile', isActive: pathname === '/profile' },
  ] : [];

  const handleNavClick = (item: any) => {
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-black px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-white border-b border-neutral-800">
      <Link href="/" className="flex items-center gap-2 md:gap-3 min-h-[2.75rem]">
        <Image
          src="/images/4BA64246-AF86-41DB-A924-7BA56CA99655_1_105_c.jpeg"
          alt="AuditoryX Logo"
          width={32}
          height={32}
          className="md:w-10 md:h-10 rounded-md object-contain"
        />
        <span className="font-bold text-lg md:text-2xl tracking-tight">AuditoryX</span>
      </Link>

      {/* Desktop Navigation - Enhanced */}
      <div className="hidden md:flex items-center space-x-6">
        {/* Command Palette Trigger */}
        <button 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-md border border-gray-700 hover:border-gray-500 min-h-[2.75rem]"
          title="Press Ctrl+K to search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">⌘K</span>
        </button>
        
        {/* Main Navigation */}
        <AnimatedNav 
          items={mainNavItems}
          orientation="horizontal"
          onItemClick={handleNavClick}
          className="mr-4"
        />

        {user ? (
          <div className="flex items-center space-x-4">
            {/* User Navigation */}
            <AnimatedNav 
              items={userNavItems}
              orientation="horizontal"
              onItemClick={handleNavClick}
              showSelector={false}
              className="mr-4"
            />
            
            {/* Notifications */}
            <NotificationBell />
            
            {/* Profile/Logout */}
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              animationType="hover"
            >
              <Translate t="nav.logout" />
            </AnimatedButton>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <AnimatedButton
                variant="ghost"
                size="sm"
                animationType="hover"
              >
                <Translate t="nav.login" />
              </AnimatedButton>
            </Link>
            <Link href="/signup">
              <AnimatedButton
                variant="primary"
                size="sm"
                animationType="glow"
              >
                <Translate t="nav.signup" />
              </AnimatedButton>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-b border-neutral-800 md:hidden">
          <div className="px-4 py-4 space-y-4">
            <AnimatedNav 
              items={[...mainNavItems, ...userNavItems]}
              orientation="vertical"
              onItemClick={handleNavClick}
            />
            
            {user ? (
              <div className="pt-4 border-t border-neutral-800">
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  animationType="hover"
                  className="w-full"
                >
                  <Translate t="nav.logout" />
                </AnimatedButton>
              </div>
            ) : (
              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <Link href="/login">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    animationType="hover"
                    className="w-full"
                  >
                    <Translate t="nav.login" />
                  </AnimatedButton>
                </Link>
                <Link href="/signup">
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    animationType="glow"
                    className="w-full"
                  >
                    <Translate t="nav.signup" />
                  </AnimatedButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
