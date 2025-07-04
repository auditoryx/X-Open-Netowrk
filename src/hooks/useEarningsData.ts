import { useState, useEffect } from 'react';

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  pendingPayouts: number;
  completedBookings: number;
  chartData: Array<{
    date: string;
    earnings: number;
    bookings: number;
  }>;
}

export function useEarningsData() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const response = await fetch('/api/admin/earnings');
        if (!response.ok) {
          throw new Error('Failed to fetch earnings data');
        }
        const data = await response.json();
        setEarnings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  return { earnings, loading, error };
}
