import { useAuth } from '@/lib/hooks/useAuth';
import EventBookingForm from '@/components/event/EventBookingForm';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <EventBookingForm />
      </div>
    </div>
  );
}
