import React from 'react';
import { EarningsData } from '@/lib/firestore/getEarningsData';

interface TopRolesCardProps {
  data: EarningsData;
  type: 'roles' | 'locations';
  className?: string;
}

const TopRolesCard: React.FC<TopRolesCardProps> = ({ data, type, className = '' }) => {
  const sourceData = type === 'roles' ? data.topRoles : data.topLocations;
  
  // Sort by revenue and get top 5
  const sortedData = Object.entries(sourceData)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTitle = () => {
    return type === 'roles' ? 'Top Performing Roles' : 'Top Performing Locations';
  };

  const getItemIcon = (item: string) => {
    if (type === 'roles') {
      const roleIcons: { [key: string]: string } = {
        'producer': '🎵',
        'singer': '🎤',
        'engineer': '🎛️',
        'songwriter': '✍️',
        'dj': '🎧',
        'instrumentalist': '🎸',
        'unknown': '❓'
      };
      return roleIcons[item.toLowerCase()] || '🎯';
    } else {
      return '📍';
    }
  };

  if (sortedData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxRevenue = sortedData[0][1].revenue;

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
      
      <div className="space-y-4">
        {sortedData.map(([item, stats], index) => {
          const percentage = maxRevenue > 0 ? (stats.revenue / maxRevenue) * 100 : 0;
          
          return (
            <div key={item} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getItemIcon(item)}</span>
                  <span className="font-medium capitalize">
                    {item === 'unknown' ? 'Other' : item}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">
                    {formatCurrency(stats.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.count} booking{stats.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === 0 
                        ? 'bg-green-500' 
                        : index === 1 
                        ? 'bg-blue-500' 
                        : index === 2 
                        ? 'bg-purple-500' 
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="absolute right-0 top-3 text-xs text-gray-500">
                  {percentage.toFixed(1)}% of top performer
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total {type}</div>
            <div className="font-semibold">{Object.keys(sourceData).length}</div>
          </div>
          <div>
            <div className="text-gray-500">Top 5 Revenue</div>
            <div className="font-semibold">
              {formatCurrency(sortedData.reduce((sum, [, stats]) => sum + stats.revenue, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRolesCard;
