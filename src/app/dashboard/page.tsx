'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/home');
  }, [router]);

  return <div className="p-6 text-white">Redirecting...</div>;
}
