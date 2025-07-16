/* ------------------------------------------------------------------
   Root layout — Noir UI (Next.js App Router)
-------------------------------------------------------------------*/
import React from 'react';
import * as Sentry from '@sentry/nextjs';

import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import StreakToast from '@/components/gamification/StreakToast';
import VerificationNotificationManager from '@/components/verification/VerificationNotificationManager';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import QueryProvider from '@/providers/QueryProvider';
import { VerificationProvider } from '@/providers/VerificationProvider';
import { ProgressiveOnboardingProvider } from '@/components/onboarding/ProgressiveOnboarding';
import OnboardingManager from '@/components/onboarding/OnboardingManager';

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
        <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <QueryProvider>
                  <VerificationProvider>
                    <ProgressiveOnboardingProvider>
                      <Navbar />
                      <StreakToast />
                      <VerificationNotificationManager />
                      <Toaster position="top-center" />
                      <OnboardingManager />
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                      </div>
                    </ProgressiveOnboardingProvider>
                  </VerificationProvider>
                </QueryProvider>
              </CartProvider>
            </LanguageProvider>
          </AuthProvider>
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}

function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ebony text-gray-100">
      <div className="text-center p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified.
        </p>
        <button
          onClick={resetError}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
