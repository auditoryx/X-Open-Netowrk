/**
 * Analytics Dashboard Page
 * 
 * Comprehensive analytics and reporting interface for admins
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Download, 
  RefreshCw,
  Filter,
  Eye,
  UserCheck,
  Star,
  Activity
} from 'lucide-react';

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  creatorCount: number;
  clientCount: number;
  verifiedCreators: number;
  growthMetrics: {
    userGrowthRate: number;
    revenueGrowthRate: number;
    bookingGrowthRate: number;
  };
}

interface AnalyticsData {
  platform: PlatformMetrics | null;
  users: any;
  bookings: any;
  revenue: any;
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    platform: null,
    users: null,
    bookings: null,
    revenue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate start date based on selected range
      switch (selectedTimeRange) {
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
      }

      // Fetch all analytics data
      const [platformRes, usersRes, bookingsRes, revenueRes] = await Promise.all([
        fetch(`/api/analytics/platform?type=platform&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/analytics/platform?type=users&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/analytics/platform?type=bookings&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/analytics/platform?type=revenue&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
      ]);

      if (!platformRes.ok) {
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
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'users' | 'bookings' | 'revenue', format: 'csv' | 'json') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days

      const response = await fetch(
        `/api/analytics/export?type=${type}&format=${format}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoryx-${type}-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform insights and metrics</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadAnalyticsData}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                const [type, format] = e.target.value.split('-');
                if (type && format) {
                  handleExport(type as any, format as any);
                }
                e.target.value = '';
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <option value="">Export Data</option>
              <option value="users-csv">Users (CSV)</option>
              <option value="bookings-csv">Bookings (CSV)</option>
              <option value="revenue-csv">Revenue (CSV)</option>
              <option value="users-json">Users (JSON)</option>
              <option value="bookings-json">Bookings (JSON)</option>
              <option value="revenue-json">Revenue (JSON)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'bookings', name: 'Bookings', icon: Calendar },
            { id: 'revenue', name: 'Revenue', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && data.platform && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.platform.totalUsers)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(data.platform.totalBookings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.platform.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.platform.conversionRate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Users Chart */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(data.platform.activeUsers.daily)}</p>
                <p className="text-sm text-gray-600">Daily Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(data.platform.activeUsers.weekly)}</p>
                <p className="text-sm text-gray-600">Weekly Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(data.platform.activeUsers.monthly)}</p>
                <p className="text-sm text-gray-600">Monthly Active</p>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Creators</span>
                  <span className="font-semibold">{formatNumber(data.platform.creatorCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Clients</span>
                  <span className="font-semibold">{formatNumber(data.platform.clientCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified Creators</span>
                  <span className="font-semibold">{formatNumber(data.platform.verifiedCreators)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold">{formatCurrency(data.platform.averageOrderValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Bookings</span>
                  <span className="font-semibold">{formatNumber(data.platform.completedBookings)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">{formatPercentage(data.platform.conversionRate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && data.users && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Registrations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold">{data.users.registrations.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold">{data.users.registrations.thisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">{data.users.registrations.thisMonth}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Retention</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Day 1</span>
                  <span className="font-semibold">{data.users.retention.day1}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Day 7</span>
                  <span className="font-semibold">{data.users.retention.day7}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Day 30</span>
                  <span className="font-semibold">{data.users.retention.day30}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Session</span>
                  <span className="font-semibold">{data.users.engagement.averageSessionDuration}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages/Session</span>
                  <span className="font-semibold">{data.users.engagement.pagesPerSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="font-semibold">{data.users.engagement.bounceRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && data.bookings && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Total Bookings</h4>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.bookings.totalBookings)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Completion Rate</h4>
              <p className="text-2xl font-bold text-green-600">{formatPercentage(data.bookings.completionRate)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Cancellation Rate</h4>
              <p className="text-2xl font-bold text-red-600">{formatPercentage(data.bookings.cancellationRate)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Avg Booking Value</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.bookings.averageBookingValue)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Status</h3>
              <div className="space-y-3">
                {Object.entries(data.bookings.bookingsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize text-gray-600">{status}</span>
                    <span className="font-semibold">{formatNumber(count as number)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Tier</h3>
              <div className="space-y-3">
                {Object.entries(data.bookings.bookingsByTier).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <span className="capitalize text-gray-600">{tier}</span>
                    <span className="font-semibold">{formatNumber(count as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && data.revenue && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue.totalRevenue)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Platform Fee</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.revenue.platformFee)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="text-sm font-medium text-gray-600">Creator Earnings</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.revenue.creatorEarnings)}</p>
            </div>
          </div>

          {/* Revenue by Month Chart */}
          {data.revenue.revenueByMonth && data.revenue.revenueByMonth.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenue.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Creators */}
          {data.revenue.topCreators && data.revenue.topCreators.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earning Creators</h3>
              <div className="space-y-3">
                {data.revenue.topCreators.slice(0, 5).map((creator, index) => (
                  <div key={creator.creatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{creator.creatorName}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(creator.earnings)}</p>
                      <p className="text-sm text-gray-500">{creator.bookingsCount} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;