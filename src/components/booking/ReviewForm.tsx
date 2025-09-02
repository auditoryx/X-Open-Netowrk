'use client';

import { useState, useEffect } from 'react';
import { submitReview } from '@/lib/firestore/reviews/submitReview';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { getFlags } from '@/lib/featureFlags';

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
  const [positiveReviewsOnly, setPositiveReviewsOnly] = useState(false);

  useEffect(() => {
    const checkFlags = async () => {
      const flags = await getFlags();
      setPositiveReviewsOnly(!!flags.POSITIVE_REVIEWS_ONLY);
    };
    checkFlags();
  }, []);

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
        // Only include rating if not in positive-only mode
        rating: positiveReviewsOnly ? undefined : rating,
      });
      toast.success('Thank you for your feedback!');
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
        {positiveReviewsOnly ? 'Share Your Experience' : 'Your Review'}
      </label>
      <textarea
        id="review-text"
        aria-label={positiveReviewsOnly ? "Share your experience" : "Leave a review"}
        placeholder={positiveReviewsOnly ? "Tell us about your experience working together..." : "Write at least 3 characters..."}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value.replace(/\s{2,}/g, ' '))}
        className="textarea-base h-24"
        disabled={loading}
        required
      />
      <div className="text-xs text-right text-gray-500">{text.length}/500</div>

      {!positiveReviewsOnly && (
        <>
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
        </>
      )}

      <button
        type="submit"
        aria-label="Submit review"
        disabled={loading || text.trim().length < 3}
        className={`btn btn-primary ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        {loading ? 'Submitting...' : (positiveReviewsOnly ? 'Share Feedback' : 'Submit Review')}
      </button>
    </form>
  );
}
