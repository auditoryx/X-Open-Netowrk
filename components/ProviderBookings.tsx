'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserBookings } from '@/lib/firestore/getUserBookings';
import { updateBookingStatus } from '@/lib/firestore/updateBookingStatus';
import { updateAvailability } from '@/lib/firestore/updateAvailability';
import { markBookingAsCompleted } from '@/lib/firestore/bookings/markBookingAsCompleted';
import { agreeToContract } from '@/lib/firestore/contracts/agreeToContract';
import ContractViewer from '@/components/contract/ContractViewer';
import { NoBookings } from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/ui/SkeletonCard';
import toast from 'react-hot-toast';
import StripeCheckout from './StripeCheckout';
import { useRouter } from 'next/navigation';

export default function ProviderBookings() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);

  const fetchBookings = async () => {
    setLoading(true);
    const data = await getUserBookings(user.uid, 'provider');
    setBookings(data);
    setLoading(false);
  };

  const fetchProvider = async () => {
    const providerData = await getUserBookings(user.uid, 'provider'); // Adjust if needed
    setProvider(providerData);
  };

  useEffect(() => {
    fetchBookings();
    fetchProvider();
  }, [user]);

  const handleStatusChange = async (id: string, status: 'accepted' | 'rejected' | 'completed', dateTime?: string) => {
    await updateBookingStatus(id, status);
    if (status === 'accepted' && provider?.availability && dateTime) {
      const updatedAvailability = provider.availability.filter((slot: string) => slot !== dateTime);
      await updateAvailability(user.uid, updatedAvailability);
    }
    fetchBookings();
  };

  const handleMarkCompleted = async (booking: any) => {
    await markBookingAsCompleted(booking.id, booking.clientId, booking.providerId);
    toast.success('Booking marked as completed. Review prompts sent.');
    fetchBookings();
  };

  const handleAgreeToContract = async (bookingId: string) => {
    await agreeToContract(bookingId, 'provider', user.uid);
    toast.success('You agreed to the contract.');
    fetchBookings();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Bookings You Received</h2>
      
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="booking" showImage={false} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <NoBookings 
          userRole="provider" 
          onCreateService={() => router.push('/dashboard?tab=services')}
        />
      ) : (
        bookings.map((b) => (
        <div key={b.id} className="border p-3 rounded mb-4 bg-white text-black">
          <p><strong>From:</strong> {b.clientId}</p>
          <p><strong>Service:</strong> {b.service}</p>
          <p><strong>Date:</strong> {b.dateTime}</p>
          <p><strong>Status:</strong> {b.status}</p>

          {b.contract && (
            <ContractViewer
              bookingId={b.id}
              terms={b.contract.terms}
              agreedByClient={b.contract.agreedByClient}
              agreedByProvider={b.contract.agreedByProvider}
              userRole="provider"
              onAgree={() => handleAgreeToContract(b.id)}
            />
          )}

          {b.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleStatusChange(b.id, 'accepted', b.dateTime)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusChange(b.id, 'rejected')}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          )}

          {b.status === 'accepted' && (
            <StripeCheckout amount={b.amount} bookingId={b.id} />
          )}

          {b.status === 'confirmed' && (
            <button
              onClick={() => handleMarkCompleted(b)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Mark as Completed
            </button>
          )}
        </div>
      ))
      )}
    </div>
  );
}
