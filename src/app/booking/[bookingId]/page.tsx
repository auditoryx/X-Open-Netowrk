"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BookingSummary from '@/components/BookingSummary';
import ReviewForm from '@/components/ReviewForm';
import { BookingType } from '@lib/pdf/generateContract';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingType | null>(null);
  const [fullBookingData, setFullBookingData] = useState<any>(null); // Full booking data including status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const checkExistingReview = async (bookingId: string) => {
      setCheckingReview(true);
      try {
        const reviewRef = doc(db, 'reviews', bookingId);
        const reviewSnap = await getDoc(reviewRef);
        setHasExistingReview(reviewSnap.exists());
      } catch (error) {
        console.error('Error checking existing review:', error);
      } finally {
        setCheckingReview(false);
      }
    };

    async function fetchBookingAndAuth() {
      if (!bookingId) return;
      try {
        const ref = doc(db, 'bookings', bookingId as string);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Booking not found.');
          setLoading(false);
          return;
        }
        const data = snap.data();
        
        // Store full booking data
        setFullBookingData(data);
        
        // Validate all required fields
        if (!data.clientName || !data.providerName || !data.serviceTitle || !data.price || !data.stripeSessionId || !data.bookingDate) {
          setError('Booking data incomplete.');
          setLoading(false);
          return;
        }
        
        // Auth check
        const auth = getAuth();
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setError('You must be signed in to view this contract.');
            setAuthorized(false);
            setLoading(false);
            return;
          }
          
          setCurrentUserId(user.uid);
          
          if (user.uid === data.clientUid || user.uid === data.providerUid) {
            setAuthorized(true);
            setBookingData({
              clientName: data.clientName,
              providerName: data.providerName,
              serviceTitle: data.serviceTitle,
              price: data.price,
              bookingDate: data.bookingDate,
              stripeSessionId: data.stripeSessionId,
            });
            
            // Check for existing review only if user is client and booking is completed
            if (user.uid === data.clientUid && data.status === 'completed') {
              await checkExistingReview(bookingId as string);
            }
          } else {
            setError('You are not authorized to view this contract.');
            setAuthorized(false);
          }
          setLoading(false);
        });
      } catch (e) {
        setError('Error fetching booking.');
        setLoading(false);
      }
    }
    fetchBookingAndAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bookingId]);

  const handleReviewSubmitted = async () => {
    // Refresh review status after submission
    if (bookingId) {
      try {
        const reviewRef = doc(db, 'reviews', bookingId as string);
        const reviewSnap = await getDoc(reviewRef);
        setHasExistingReview(reviewSnap.exists());
      } catch (error) {
        console.error('Error checking review after submission:', error);
      }
    }
  };

  const shouldShowReviewForm = 
    fullBookingData &&
    fullBookingData.status === 'completed' &&
    currentUserId === fullBookingData.clientUid &&
    !hasExistingReview &&
    !checkingReview;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Booking Details</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {authorized && bookingData && (
        <div className="space-y-6">
          <BookingSummary bookingData={bookingData} />
          
          {/* Booking Status */}
          {fullBookingData && (
            <div className="text-center">
              <p className="text-gray-300 mb-2">
                Status: <span className={`font-bold ${
                  fullBookingData.status === 'completed' ? 'text-green-400' :
                  fullBookingData.status === 'paid' ? 'text-blue-400' :
                  fullBookingData.status === 'pending' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {fullBookingData.status}
                </span>
              </p>
            </div>
          )}
          
          {/* Chat Link */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/booking/${bookingId}/chat`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              💬 Open Chat
            </button>
            <p className="text-gray-400 text-sm mt-2">
              Communicate with the other party about this booking
            </p>
          </div>

          {/* Review Form - Only show for completed bookings to clients who haven't reviewed */}
          {shouldShowReviewForm && (
            <div className="max-w-2xl mx-auto">
              <ReviewForm
                bookingId={bookingId as string}
                providerUid={fullBookingData.providerUid}
                clientUid={fullBookingData.clientUid}
                serviceTitle={fullBookingData.serviceTitle}
                onSubmitted={handleReviewSubmitted}
              />
            </div>
          )}

          {/* Review Already Submitted Message */}
          {fullBookingData &&
            fullBookingData.status === 'completed' &&
            currentUserId === fullBookingData.clientUid &&
            hasExistingReview && (
            <div className="text-center bg-green-900 border border-green-600 rounded-lg p-4">
              <p className="text-green-400">✅ Thank you! Your review has been submitted.</p>
            </div>
          )}

          {/* Review Loading State */}
          {checkingReview && (
            <div className="text-center">
              <p className="text-gray-400">Checking review status...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
