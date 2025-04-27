'use client';

import Navbar from '@/app/components/Navbar';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/app/firebase';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-10 text-center">Dashboard</h1>
        <div className="flex flex-col space-y-6">
          <button onClick={() => router.push('/dashboard/services')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            Manage My Services
          </button>
          <button onClick={() => router.push('/services/add')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            Add New Service
          </button>
          <button onClick={() => router.push('/dashboard/orders')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            View Orders (Sales)
          </button>
          <button onClick={() => router.push('/dashboard/purchases')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            View Purchases (Buy History)
          </button>
          <button onClick={handleLogout} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
