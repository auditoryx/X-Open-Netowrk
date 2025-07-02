import React from 'react';
import { EarningsData } from '@/lib/firestore/getEarningsData';

interface EarningsChartProps {
  data: EarningsData;
  period: 'weekly' | 'monthly';
  className?: string;
}

const EarningsChart: React.FC<EarningsChartProps> = ({ data, period, className = '' }) => {
  const periodData = data.periodData[period];
  const dataPoints = Object.entries(periodData).sort(([a], [b]) => a.localeCompare(b));
  
  // Get max value for scaling
  const maxValue = Math.max(...Object.values(periodData));
  const minValue = Math.min(...Object.values(periodData));
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format period label
  const formatPeriodLabel = (key: string) => {
    if (period === 'weekly') {
      const [year, week] = key.split('-W');
      return `Week ${week}`;
    } else {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  if (dataPoints.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {period === 'weekly' ? 'Weekly' : 'Monthly'} Earnings Trend
        </h3>
        <div className="text-center py-8 text-gray-500">
          No earnings data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">
        {period === 'weekly' ? 'Weekly' : 'Monthly'} Earnings Trend
      </h3>
      
      <div className="space-y-4">
        {/* Simple Bar Chart */}
        <div className="relative">
          <div className="flex items-end space-x-2 h-64">
            {dataPoints.map(([key, value], index) => {
              const height = maxValue > 0 ? (value / maxValue) * 240 : 0;
              const isHighest = value === maxValue;
              
              return (
                <div
                  key={key}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  {/* Bar */}
                  <div
                    className={`w-full transition-all duration-300 hover:opacity-80 rounded-t ${
                      isHighest 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    {formatCurrency(value)}
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                    {formatPeriodLabel(key)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-500 -ml-12">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency(maxValue * 0.75)}</span>
            <span>{formatCurrency(maxValue * 0.5)}</span>
            <span>{formatCurrency(maxValue * 0.25)}</span>
            <span>$0</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-500">Average</div>
            <div className="font-semibold">
              {formatCurrency(dataPoints.reduce((sum, [, value]) => sum + value, 0) / dataPoints.length)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Highest</div>
            <div className="font-semibold text-green-600">
              {formatCurrency(maxValue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Lowest</div>
            <div className="font-semibold text-red-600">
              {formatCurrency(minValue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Total Periods</div>
            <div className="font-semibold">
              {dataPoints.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;
