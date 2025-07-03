'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { creatorAnalyticsService, AnalyticsMetrics, RevenueData, PerformanceInsight } from '@/lib/services/creatorAnalyticsService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Star, 
  Download,
  AlertCircle,
  CheckCircle,
  Target,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function EnhancedAnalyticsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [metricsData, revenueChartData, insightsData] = await Promise.all([
        creatorAnalyticsService.getCreatorMetrics(user.uid, timeRange),
        creatorAnalyticsService.getRevenueData(user.uid, timeRange),
        creatorAnalyticsService.getPerformanceInsights(user.uid)
      ]);

      setMetrics(metricsData);
      setRevenueData(revenueChartData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!user?.uid) return;
    
    setExporting(true);
    try {
      const data = await creatorAnalyticsService.exportAnalyticsData(user.uid, format);
      
      // Create and download file
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInsightIcon = (type: PerformanceInsight['type']) => {
    switch (type) {
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'improvement':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-neutral-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
          <div className="bg-neutral-800 rounded-lg p-6 h-96"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 text-white text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Analytics Data</h2>
        <p className="text-gray-400">Complete some bookings to see your analytics.</p>
      </div>
    );
  }

  const peakHoursData = metrics.busyHours.map(hour => ({
    hour: `${hour}:00`,
    bookings: Math.floor(Math.random() * 10) + 1
  }));

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Enhanced Analytics</h1>
          <p className="text-gray-400">Advanced insights for your creator business</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Export Button */}
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Earnings</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(metrics.totalEarnings)}</p>
          <div className="flex items-center mt-2">
            {metrics.earningsGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${metrics.earningsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(metrics.earningsGrowth).toFixed(1)}%
            </span>
            <span className="text-gray-400 text-sm ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Bookings</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.totalBookings}</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-400">
              {metrics.completedBookings} completed ({metrics.completionRate.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
          <div className="flex items-center mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= metrics.averageRating ? 'text-yellow-500 fill-current' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Response Time</h3>
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{metrics.messageResponseTime.toFixed(1)}h</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-400">
              {metrics.responseRate.toFixed(1)}% response rate
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="bookings" fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`border-l-4 pl-4 py-3 ${
                  insight.type === 'achievement' ? 'border-green-500 bg-green-500/10' :
                  insight.type === 'improvement' ? 'border-blue-500 bg-blue-500/10' :
                  'border-red-500 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-gray-300 text-sm mt-1">{insight.description}</p>
                    {insight.actionable && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-brand-500 text-white rounded">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Peak Days</h3>
          <div className="space-y-2">
            {metrics.peakBookingDays.map((day, index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-gray-300">{day}</span>
                <span className="text-sm text-brand-400">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Order Value</span>
              <span className="font-medium">{formatCurrency(metrics.averageOrderValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profile Views</span>
              <span className="font-medium">{metrics.profileViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Projection</span>
              <span className="font-medium">{formatCurrency(metrics.monthlyEarnings)}</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Optimization Tips</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
              <span className="text-gray-300">Update your portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
              <span className="text-gray-300">Improve response time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
              <span className="text-gray-300">Add more services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
