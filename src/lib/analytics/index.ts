/**
 * Analytics Module Index
 * 
 * Exports all analytics functionality including services, components, and hooks
 */

// Core analytics service
export { platformAnalytics } from './platform-metrics';
export type {
  PlatformMetrics,
  UserMetrics,
  BookingMetrics,
  RevenueMetrics,
  AnalyticsTimeRange,
} from './platform-metrics';

// Analytics configuration and tracking
export {
  Analytics,
  PrivacyCompliance,
  ABTesting,
  analyticsConfig,
  USER_EVENTS,
  CONVERSION_FUNNELS,
  BUSINESS_KPIS,
  trackUserEvent,
  trackPageView,
  trackConversion,
  trackBusinessMetric,
} from './config';
export type { AnalyticsEvent } from './config';

// Simple tracking utility
export { track } from './track';
export type { AnalyticsPayload } from './track';

// Export analytics components and utilities from components
export {
  MetricsCard,
  ChartComponent,
  ReportExport,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  chartColors,
  ANALYTICS_CONSTANTS,
} from '@/components/analytics';

// Export analytics hook
export { useAnalytics } from '@/hooks/useAnalytics';

// Analytics utilities
export const ANALYTICS_UTILS = {
  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Calculate growth rate over a period
   */
  calculateGrowthRate: (values: number[]): number => {
    if (values.length < 2) return 0;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    return ((lastValue - firstValue) / firstValue) * 100;
  },

  /**
   * Get time range dates for analytics queries
   */
  getTimeRangeDates: (range: string): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '24h':
        start.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }

    return { start, end };
  },

  /**
   * Format analytics data for charts
   */
  formatChartData: (data: any[], xKey: string, yKey: string) => {
    return data.map(item => ({
      name: item[xKey],
      value: item[yKey],
    }));
  },

  /**
   * Aggregate data by time period
   */
  aggregateByTimePeriod: (
    data: any[],
    dateField: string,
    valueField: string,
    period: 'day' | 'week' | 'month'
  ) => {
    const aggregated = new Map<string, number>();

    data.forEach(item => {
      const date = new Date(item[dateField]);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      const currentValue = aggregated.get(key) || 0;
      aggregated.set(key, currentValue + (item[valueField] || 0));
    });

    return Array.from(aggregated.entries()).map(([period, value]) => ({
      period,
      value,
    }));
  },

  /**
   * Calculate conversion funnel metrics
   */
  calculateFunnelMetrics: (steps: { name: string; count: number }[]) => {
    return steps.map((step, index) => {
      const conversionRate = index === 0 ? 100 : (step.count / steps[0].count) * 100;
      const dropOffRate = index === 0 ? 0 : ((steps[index - 1].count - step.count) / steps[index - 1].count) * 100;
      
      return {
        ...step,
        conversionRate,
        dropOffRate,
        stepConversionRate: index === 0 ? 100 : (step.count / steps[index - 1].count) * 100,
      };
    });
  },
} as const;

// Version information
export const ANALYTICS_VERSION = '1.0.0';
export const ANALYTICS_MODULE_INFO = {
  version: ANALYTICS_VERSION,
  features: [
    'Platform Metrics',
    'User Analytics',
    'Booking Analytics',
    'Revenue Analytics',
    'Real-time Data',
    'Data Export',
    'Interactive Charts',
    'Custom Time Ranges',
    'Privacy Compliance',
    'A/B Testing',
  ],
  components: [
    'MetricsCard',
    'ChartComponent',
    'ReportExport',
    'AnalyticsDashboard',
  ],
  integrations: [
    'Firebase Firestore',
    'Google Analytics',
    'Mixpanel',
    'Hotjar',
    'Amplitude',
  ],
} as const;