import { useState, useEffect } from 'react';

interface ReviewAggregateData {
  targetId: string;
  averageRating: number | null;
  reviewCount: number;
  ratingDistribution: Record<number, number>;
  hasReviews: boolean;
}

interface UseReviewAggregateResult {
  data: ReviewAggregateData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReviewAggregate(targetId: string): UseReviewAggregateResult {
  const [data, setData] = useState<ReviewAggregateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/aggregate?targetId=${encodeURIComponent(targetId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch review data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching review aggregate:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch review data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export default useReviewAggregate;