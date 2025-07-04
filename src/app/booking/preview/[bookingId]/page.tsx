'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getBookingById, BookingData } from '@/lib/firestore/getBookingById';
import { getUserProfile } from '@/lib/firestore/getUserProfile';
import { ContractPreview } from '@/components/booking/ContractPreview';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function BookingPreviewPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!bookingId || !user) return;

    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch booking data
        const bookingData = await getBookingById(bookingId as string);
        if (!bookingData) {
          setError('Booking not found');
          return;
        }

        // Check authorization - only client or provider can view
        if (user.uid !== bookingData.clientUid && user.uid !== bookingData.providerUid) {
          setError('You are not authorized to view this contract');
          return;
        }

        // Check if booking is in correct status for payment
        if (!['pending', 'accepted'].includes(bookingData.status)) {
          setError(`This booking is ${bookingData.status} and cannot be paid for`);
          return;
        }

        setBooking(bookingData);

        // Fetch client and provider profiles
        const [clientData, providerData] = await Promise.all([
          getUserProfile(bookingData.clientUid),
          getUserProfile(bookingData.providerUid)
        ]);

        setClientProfile(clientData);
        setProviderProfile(providerData);

      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, user]);

  const handleProceedToPayment = async () => {
    if (!booking || !user) return;

    setPaymentLoading(true);
    try {
      // Call the API route for checkout session creation
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.price,
          buyerEmail: user.email || '',
          providerId: booking.providerUid
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(`Payment setup failed: ${result.error || 'Unknown error'}`);
        return;
      }

      if (result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        setError('Failed to create payment session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to proceed to payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in to view this contract
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Contract
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </button>
        </div>

        {/* Contract Preview */}
        <ContractPreview
          booking={booking}
          clientProfile={clientProfile}
          providerProfile={providerProfile}
          onProceedToPayment={handleProceedToPayment}
          loading={paymentLoading}
        />

        {/* Additional Info */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Payment Protection
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Your payment is held securely in escrow until the service is completed</li>
              <li>• Full refund available if the provider doesn't deliver as promised</li>
              <li>• 24/7 customer support available for any payment issues</li>
              <li>• All transactions are encrypted and PCI-compliant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
