/**
 * Analytics Metrics Card Component
 * 
 * Reusable component for displaying key metrics with icons and trends
 */

'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number; // Percentage change
  changeLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray';
  loading?: boolean;
  format?: 'number' | 'currency' | 'percentage';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = 'blue',
  loading = false,
  format = 'number',
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        darkText: 'text-blue-700',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        darkText: 'text-green-700',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        darkText: 'text-purple-700',
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        darkText: 'text-yellow-700',
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        darkText: 'text-red-700',
      },
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        darkText: 'text-gray-700',
      },
    };
    
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendText = () => {
    if (change === undefined) return null;
    
    const absChange = Math.abs(change);
    const changeText = `${absChange.toFixed(1)}%`;
    
    if (change > 0) return <span className="text-green-600">+{changeText}</span>;
    if (change < 0) return <span className="text-red-600">-{changeText}</span>;
    return <span className="text-gray-600">{changeText}</span>;
  };

  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className={`p-2 ${colorClasses.bg} rounded-lg`}>
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
          {(change !== undefined || changeLabel) && (
            <div className="mt-4 flex items-center">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-2 ${colorClasses.bg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${colorClasses.text}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
        </div>
      </div>
      
      {(change !== undefined || changeLabel) && (
        <div className="mt-4 flex items-center text-sm">
          {getTrendIcon()}
          <span className="ml-1">
            {getTrendText()}
            {changeLabel && (
              <span className="text-gray-500 ml-1">{changeLabel}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;