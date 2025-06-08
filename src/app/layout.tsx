import './globals.css';
import Navbar from './components/Navbar';
import { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
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
            <QueryProvider>
              <Toaster position="top-center" />
              <StreakToast />
              <Navbar />
              {children}
            </QueryProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
