'use client';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProgressiveOnboardingProvider } from '@/components/onboarding/ProgressiveOnboarding';
import QueryProvider from '@/providers/QueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <QueryProvider>
          <AuthProvider>
            <LanguageProvider>
              <ProgressiveOnboardingProvider>
                {children}
                <Toaster />
              </ProgressiveOnboardingProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
