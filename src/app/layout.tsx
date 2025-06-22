import '@fontsource/space-grotesk/variable.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

import '@/styles/globals.css';
import Navbar from './components/Navbar';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import TourTooltip from '@/components/onboarding/TourTooltip';
import { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '../../providers/QueryProvider';
import StreakToast from '../components/gamification/StreakToast';



export const metadata: Metadata = {
  title: 'AuditoryX Open Network',
  description: 'Global platform for artists, producers, creatives, and studios',
  openGraph: {
    title: 'AuditoryX Open Network',
    description: 'Global platform for artists, producers, creatives, and studios',
    images: 'https://placehold.co/1200x630/png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <QueryProvider>
                <Toaster position="top-center" />
                <StreakToast />
                <OnboardingTour />
                <TourTooltip />
                <Navbar />
                {children}
              </QueryProvider>
            </CartProvider>
          </LanguageProvider>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
