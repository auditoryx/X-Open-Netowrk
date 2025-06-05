'use client';

import { useState } from 'react';
import { submitReview } from '@/lib/firestore/reviews/submitReview';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  contractId: string;
  onSubmitSuccess?: () => void;
}

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
      toast.success('Review submitted!');
      setSubmitted(true);
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
      <label htmlFor="review-text" className="text-sm font-medium">
        Your Review
      </label>
      <textarea
        id="review-text"
        aria-label="Leave a review"
        placeholder="Write at least 3 characters..."
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value.replace(/\s{2,}/g, ' '))}
        className="textarea-base h-24"
        disabled={loading}
        required
      />
      <div className="text-xs text-right text-gray-500">{text.length}/500</div>

      <label htmlFor="review-rating" className="text-sm font-medium">
        Rating
      </label>
      <select
        id="review-rating"
        aria-label="Rating out of 5"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="input-base"
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
  className={`btn btn-primary ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
>
  {loading ? 'Submitting...' : 'Submit Review'}
</button>

      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
