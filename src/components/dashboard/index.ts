/**
 * Dashboard Components Index
 * 
 * Exports enhanced Phase 4 dashboard components
 */

// Enhanced Dashboard Components (Phase 4)
export { default as StatsCard } from './StatsCard';
export { default as AnimatedChart } from './AnimatedChart';
export { default as MetricDisplay } from './MetricDisplay';

// Types for enhanced components
export interface StatsCardData {
  title: string;
  value: string | number;
  icon: any; // LucideIcon
  change?: number;
  changeLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray' | 'cyan' | 'orange';
  loading?: boolean;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  showProgress?: boolean;
  progress?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface MetricData {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  color?: string;
  trend?: number;
  trendLabel?: string;
}

// Utility functions for dashboard data formatting
export const formatDashboardValue = (value: number, format: string = 'number'): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
  }
};

// Dashboard color schemes
export const dashboardColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  orange: '#F97316',
  gray: '#6B7280',
};

// Dashboard animation configurations
export const dashboardAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};