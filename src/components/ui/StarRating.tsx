'use client';
import { AiFillStar } from 'react-icons/ai';

interface StarRatingProps {
  rating: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function StarRating({ rating, onChange, disabled }: StarRatingProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={value}
            type="button"
            aria-label={`${value} star`}
            onClick={() => !disabled && onChange?.(value)}
            className="focus:outline-none"
          >
            <AiFillStar className={value <= rating ? 'text-yellow-400' : 'text-gray-400'} />
          </button>
        );
      })}
    </div>
  );
}
