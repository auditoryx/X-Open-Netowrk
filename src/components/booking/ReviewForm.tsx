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

type ReviewInput = {
  text: string;
  rating: number;
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
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const reviewPayload = {
      bookingId,
      providerId,
      clientId: user.uid,
      contractId,
      text,
      rating,
    };

    try {
      await submitReview(reviewPayload);
      setSubmitted(true);
      toast.success('Review submitted!');
      onSubmitSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    }
  };

  if (submitted) return <p className="text-green-600">Thanks for your feedback!</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded">
      <textarea
        placeholder="Leave a review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="p-2 border rounded"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} Stars
          </option>
        ))}
      </select>
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Submit Review
      </button>
    </form>
  );
}
