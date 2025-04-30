'use client';

import { useState } from 'react';

type Review = {
  text: string;
  rating: number;
};

export default function ReviewForm({ onSubmit }: { onSubmit: (review: Review) => void }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ text, rating });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded">
      <textarea
        placeholder="Leave a review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="p-2 border rounded"
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
// // ✅ Correctly placed import
// // ✅ Inside the submit block
// // ✅ Correctly placed import
// // ✅ Inside the submit block
// // ✅ Correctly placed import
// // ✅ Inside the submit block        