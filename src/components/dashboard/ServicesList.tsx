'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { NoServices } from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { useRouter } from 'next/navigation';

interface Service {
  id: number;
  title: string;
  price: number;
}

interface ServicesListProps {
  isOwnProfile?: boolean;
}

export default function ServicesList({ isOwnProfile = true }: ServicesListProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Mock data for now - replace with actual Firestore call
    setTimeout(() => {
      setServices([
        { id: 1, title: 'Mixing & Mastering', price: 100 },
        { id: 2, title: 'Beat Production', price: 250 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Services</h2>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} variant="service" showImage={false} />
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Services</h2>
        <NoServices 
          isOwnProfile={isOwnProfile} 
          onCreateService={() => router.push('/dashboard?tab=services')}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow">
      <h2 className="text-xl font-semibold">Your Services</h2>
      <ul className="mt-4 space-y-2">
        {services.map(service => (
          <li key={service.id} className="flex justify-between items-center p-3 bg-gray-800 rounded">
            <span>{service.title}</span>
            <span className="text-green-400">${service.price}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => router.push('/dashboard?tab=services')}
        className="mt-4 px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
      >
        Manage Services
      </button>
    </div>
  );
}
