'use client';

import { useState } from 'react';
import { submitReview } from '@/lib/firestore/reviews/submitReview';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

type ReviewFormProps = {
  bookingId: string;
  providerId: string;
  contractId: string;
  onSubmitSuccess?: () => void;
};

export default function ReviewForm({
  bookingId,
  providerId,
  contractId,
  onSubmitSuccess,
}: ReviewFormProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || loading || text.trim().length < 3) return;

    setLoading(true);

    try {
      await submitReview({
        bookingId,
        providerId,
        clientId: user.uid,
        contractId,
        text: text.trim(),
        rating,
      });

      setSubmitted(true);
      toast.success('Review submitted!');
      onSubmitSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="text-green-600">Thanks for your feedback!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded bg-white text-black">
      <label htmlFor="review-text" className="text-sm font-medium">Your Review</label>
      <textarea
        id="review-text"
        aria-label="Leave a review"
        placeholder="Write at least 3 characters..."
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value.replace(/\s{2,}/g, ' '))}
        className="p-2 border rounded resize-none h-24"
        disabled={loading}
        required
      />
      <div className="text-xs text-right text-gray-500">{text.length}/500</div>

      <label htmlFor="review-rating" className="text-sm font-medium">Rating</label>
      <select
        id="review-rating"
        aria-label="Rating out of 5"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="p-2 border rounded"
        disabled={loading}
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} Stars
          </option>
        ))}
      </select>

      <button
        type="submit"
        aria-label="Submit review"
        disabled={loading || text.trim().length < 3}
        className={`px-4 py-2 rounded text-white font-medium transition ${
          loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-black hover:bg-white hover:text-black border border-black'
        }`}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
//   //   console.log('Booking request sent:', message);
// //   }}
// //   />
// //
// // Example usage
// // <BookingChatThread bookingId="12345" /> 
// // <BookingChatThread bookingId="67890" />
// // <BookingChatThread bookingId="54321" />
// // <BookingChatThread bookingId="98765" />
// // <BookingChatThread bookingId="11223" />
// // <BookingChatThread bookingId="44556" />
// // <BookingChatThread bookingId="77889" />
// // <BookingChatThread bookingId="99000" />