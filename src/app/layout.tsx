import './globals.css';
import Navbar from './components/Navbar';
import { Inter, Poppins } from 'next/font/google';
import { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const poppins = Poppins({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'AuditoryX Open Network',
  description: 'Global platform for artists, producers, creatives, and studios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <Toaster position="top-center" />
            <Navbar />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
