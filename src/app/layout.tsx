/* ------------------------------------------------------------------
   Root layout — Noir UI (Next.js App Router)
-------------------------------------------------------------------*/
import React from 'react';

import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import StreakToast from '@/components/gamification/StreakToast';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import QueryProvider from '@/providers/QueryProvider';

export const metadata = {
  title: 'AuditoryX – Global Creative Network',
  description: 'Book talent, sell services, and get paid.',
  openGraph: {
    title: 'AuditoryX – Global Creative Network',
    description: 'Book talent, sell services, and get paid.',
    images: 'https://placehold.co/1200x630/png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ebony text-gray-100">
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <QueryProvider>
                <Navbar />
                <StreakToast />
                <Toaster position="top-center" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </QueryProvider>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
