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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Star, 
  Clock,
  Download,
  AlertCircle,
  CheckCircle,
  Target,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function CreatorAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics | null>(null);
  const [revenueInsights, setRevenueInsights] = useState<RevenueInsights | null>(null);

  const loadAnalytics = async (showRefreshLoader = false) => {
    if (!user?.uid) return;
    
    if (showRefreshLoader) setRefreshing(true);
    else setLoading(true);

    try {
      const [earnings, performance, clients, insights] = await Promise.all([
        creatorAnalyticsService.getEarningsData(user.uid, timeRange),
        creatorAnalyticsService.getPerformanceMetrics(user.uid),
        creatorAnalyticsService.getClientMetrics(user.uid),
        creatorAnalyticsService.getRevenueInsights(user.uid)
      ]);

      setEarningsData(earnings);
      setPerformanceMetrics(performance);
      setClientMetrics(clients);
      setRevenueInsights(insights);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange]);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-neutral-800 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-neutral-800 rounded-lg"></div>
            <div className="h-64 bg-neutral-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const earningsChartData = {
    labels: earningsData?.dailyEarnings.map(d => d.date) || [],
    datasets: [
      {
        label: 'Daily Earnings',
        data: earningsData?.dailyEarnings.map(d => d.amount) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      },
    ],
  };

  const monthlyEarningsChartData = {
    labels: earningsData?.monthlyEarnings.map(d => d.month) || [],
    datasets: [
      {
        label: 'Monthly Earnings',
        data: earningsData?.monthlyEarnings.map(d => d.amount) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const clientSatisfactionData = {
    labels: ['Satisfied', 'Neutral', 'Dissatisfied'],
    datasets: [
      {
        data: [
          clientMetrics?.clientSatisfactionScore || 0,
          20,
          100 - (clientMetrics?.clientSatisfactionScore || 0) - 20
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 text-white space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Analytics</h1>
          <p className="text-gray-400 mt-1">Insights and performance metrics for your creator journey</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">${earningsData?.totalEarned.toLocaleString() || 0}</p>
              <p className="text-green-400 text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% vs last period
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{earningsData?.totalBookings || 0}</p>
              <p className="text-blue-400 text-sm">${earningsData?.averageBookingValue.toFixed(0) || 0} avg</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold">{performanceMetrics?.averageResponseTime.toFixed(1) || 0}h</p>
              <p className="text-green-400 text-sm">{performanceMetrics?.completionRate.toFixed(0) || 0}% completion</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Rating</p>
              <p className="text-2xl font-bold">{performanceMetrics?.averageRating.toFixed(1) || 0}</p>
              <p className="text-yellow-400 text-sm">{performanceMetrics?.totalReviews || 0} reviews</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Earnings Trend
          </h3>
          <div className="h-64">
            <Line 
              data={earningsChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#9CA3AF' } }
                }
              }} 
            />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Revenue
          </h3>
          <div className="h-64">
            <Bar 
              data={monthlyEarningsChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#9CA3AF' } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Satisfaction */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Client Satisfaction
          </h3>
          <div className="h-48">
            <Doughnut 
              data={clientSatisfactionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'bottom' as const,
                    labels: { color: '#9CA3AF' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top Clients
          </h3>
          <div className="space-y-3">
            {clientMetrics?.topClients.slice(0, 5).map((client, index) => (
              <div key={client.clientId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.clientName}</p>
                    <p className="text-sm text-gray-400">{client.bookingCount} bookings</p>
                  </div>
                </div>
                <p className="font-bold text-green-400">${client.totalSpent.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Performance Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Rate</span>
                <span>{performanceMetrics?.completionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${performanceMetrics?.completionRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Repeat Client Rate</span>
                <span>{performanceMetrics?.repeatClientRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${performanceMetrics?.repeatClientRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quality Score</span>
                <span>{((performanceMetrics?.averageRating || 0) * 20).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(performanceMetrics?.averageRating || 0) * 20}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Optimization */}
      {revenueInsights?.priceOptimizationSuggestions && revenueInsights.priceOptimizationSuggestions.length > 0 && (
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Price Optimization Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueInsights.priceOptimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-neutral-700 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium mb-2">Service {suggestion.serviceId}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current:</span>
                    <span>${suggestion.currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Suggested:</span>
                    <span className="text-green-400">${suggestion.suggestedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential:</span>
                    <span className={suggestion.expectedIncrease > 0 ? 'text-green-400' : 'text-red-400'}>
                      {suggestion.expectedIncrease > 0 ? '+' : ''}{suggestion.expectedIncrease.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
