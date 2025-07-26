/**
 * Analytics Data Hook
 * 
 * Custom hook for fetching and managing analytics data
 */

import { useState, useEffect, useCallback } from 'react';

interface AnalyticsData {
  platform: any;
  users: any;
  bookings: any;
  revenue: any;
}

interface UseAnalyticsOptions {
  timeRange?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAnalyticsReturn {
  data: AnalyticsData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  exportData: (type: 'users' | 'bookings' | 'revenue', format: 'csv' | 'json') => Promise<void>;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
  const {
    timeRange = '30d',
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState<AnalyticsData>({
    platform: null,
    users: null,
    bookings: null,
    revenue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDateRange = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }, [timeRange]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = calculateDateRange();
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Fetch all analytics data in parallel
      const [platformRes, usersRes, bookingsRes, revenueRes] = await Promise.all([
        fetch(`/api/analytics/platform?type=platform&startDate=${startDateStr}&endDate=${endDateStr}`),
        fetch(`/api/analytics/platform?type=users&startDate=${startDateStr}&endDate=${endDateStr}`),
        fetch(`/api/analytics/platform?type=bookings&startDate=${startDateStr}&endDate=${endDateStr}`),
        fetch(`/api/analytics/platform?type=revenue&startDate=${startDateStr}&endDate=${endDateStr}`),
      ]);

      // Check if all requests were successful
      if (!platformRes.ok || !usersRes.ok || !bookingsRes.ok || !revenueRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [platform, users, bookings, revenue] = await Promise.all([
        platformRes.json(),
        usersRes.json(),
        bookingsRes.json(),
        revenueRes.json(),
      ]);

      setData({
        platform: platform.data,
        users: users.data,
        bookings: bookings.data,
        revenue: revenue.data,
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [calculateDateRange]);

  const exportData = useCallback(async (type: 'users' | 'bookings' | 'revenue', format: 'csv' | 'json') => {
    try {
      const { startDate, endDate } = calculateDateRange();
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      const response = await fetch(
        `/api/analytics/export?type=${type}&format=${format}&startDate=${startDateStr}&endDate=${endDateStr}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoryx-${type}-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      throw err;
    }
  }, [calculateDateRange]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    refresh: fetchAnalyticsData,
    exportData,
  };
};