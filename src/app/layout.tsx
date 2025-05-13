import './globals.css';
import Navbar from './components/Navbar';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <LanguageProvider>
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { useSession } from 'next-auth/react';