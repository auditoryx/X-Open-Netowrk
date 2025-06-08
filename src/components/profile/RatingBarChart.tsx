'use client';
import React from 'react';

interface RatingBarChartProps {
  distribution: Record<number, number>;
}

export default function RatingBarChart({ distribution }: RatingBarChartProps) {
  const max = Math.max(...Object.values(distribution));
  return (
    <div className="space-y-1 mt-2">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = distribution[star] || 0;
        const width = max ? (count / max) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-10 text-right">{star}★</span>
            <div className="flex-1 bg-gray-700 rounded">
              <div className="bg-yellow-400 h-2 rounded" style={{ width: `${width}%` }} />
            </div>
            <span className="w-6 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
