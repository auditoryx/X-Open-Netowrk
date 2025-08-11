/**
 * Analytics Components Index
 * 
 * Exports all analytics-related components and utilities
 */

// Enhanced Analytics Components (Phase 4)
export { default as AnimatedMetric } from './AnimatedMetric';
export { default as ProgressRing } from './ProgressRing';
export { default as TrendIndicator } from './TrendIndicator';

// Legacy Analytics Components
export { default as MetricsCard } from './MetricsCard';
export { default as ChartComponent } from './ChartComponent';
export { default as ReportExport } from './ReportExport';

// Types
export type { default as MetricsCardProps } from './MetricsCard';

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Color schemes for charts
export const chartColors = {
  primary: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
  blue: ['#3B82F6', '#1E40AF', '#60A5FA', '#93C5FD', '#DBEAFE'],
  green: ['#10B981', '#047857', '#34D399', '#6EE7B7', '#D1FAE5'],
  purple: ['#8B5CF6', '#6D28D9', '#A78BFA', '#C4B5FD', '#EDE9FE'],
  mixed: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'],
};

// Analytics constants
export const ANALYTICS_CONSTANTS = {
  TIME_RANGES: [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ],
  EXPORT_FORMATS: [
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
  ],
  CHART_TYPES: [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'pie', label: 'Pie Chart' },
  ],
} as const;