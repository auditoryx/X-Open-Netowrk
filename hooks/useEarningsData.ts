import { useState, useEffect } from 'react';
import { getEarningsData, getEarningsForPeriod, EarningsData } from '@/lib/firestore/getEarningsData';

export type TimePeriod = 'week' | 'month' | 'year';

interface UseEarningsDataResult {
  data: EarningsData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEarningsData(
  period?: TimePeriod,
  startDate?: Date,
  endDate?: Date
): UseEarningsDataResult {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let earningsData: EarningsData;
      
      if (period) {
        earningsData = await getEarningsForPeriod(period);
      } else {
        earningsData = await getEarningsData(startDate, endDate);
      }
      
      setData(earningsData);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch earnings data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, startDate, endDate]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for getting earnings comparison between periods
 */
export function useEarningsComparison(period: TimePeriod) {
  const [currentData, setCurrentData] = useState<EarningsData | null>(null);
  const [previousData, setPreviousData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);

        const [current, previous] = await Promise.all([
          getEarningsForPeriod(period, 0), // Current period
          getEarningsForPeriod(period, 1)  // Previous period
        ]);

        setCurrentData(current);
        setPreviousData(previous);
      } catch (err) {
        console.error('Error fetching earnings comparison:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch earnings comparison'));
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [period]);

  // Calculate growth percentages
  const growthMetrics = {
    revenueGrowth: previousData?.totalRevenue 
      ? ((currentData?.totalRevenue || 0) - previousData.totalRevenue) / previousData.totalRevenue * 100
      : 0,
    bookingGrowth: previousData?.bookingCount
      ? ((currentData?.bookingCount || 0) - previousData.bookingCount) / previousData.bookingCount * 100
      : 0,
    commissionGrowth: previousData?.platformCommission
      ? ((currentData?.platformCommission || 0) - previousData.platformCommission) / previousData.platformCommission * 100
      : 0
  };

  return {
    currentData,
    previousData,
    growthMetrics,
    loading,
    error
  };
}
