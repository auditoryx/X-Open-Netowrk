'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Building2, Users, Calendar, DollarSign, TrendingUp, Star,
  Music, Headphones, Clock, Award, AlertCircle, CheckCircle,
  Plus, Filter, Download, Search, Settings, Bell
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalArtists: number;
  totalBookings: number;
  totalProjects: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  averageRating: number;
  completionRate: number;
}

interface Artist {
  id: string;
  name: string;
  stageName?: string;
  totalEarnings: number;
  totalBookings: number;
  rating?: number;
  avatar?: string;
  genres: string[];
  verificationStatus: string;
}

interface RecentBooking {
  id: string;
  title: string;
  artist: { name: string; avatar?: string };
  project?: { name: string };
  startDate: string;
  status: string;
  finalPrice?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function LabelDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArtists: 0,
    totalBookings: 0,
    totalProjects: 0,
    revenueThisMonth: 0,
    revenueGrowth: 0,
    averageRating: 0,
    completionRate: 0,
  });
  
  const [artists, setArtists] = useState<Artist[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  
  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, bookings: 120 },
    { month: 'Feb', revenue: 52000, bookings: 145 },
    { month: 'Mar', revenue: 48000, bookings: 135 },
    { month: 'Apr', revenue: 61000, bookings: 168 },
    { month: 'May', revenue: 55000, bookings: 152 },
    { month: 'Jun', revenue: 67000, bookings: 189 },
  ];

  const genreDistribution = [
    { name: 'Hip Hop', value: 35, count: 28 },
    { name: 'R&B', value: 25, count: 20 },
    { name: 'Pop', value: 20, count: 16 },
    { name: 'Rock', value: 12, count: 10 },
    { name: 'Electronic', value: 8, count: 6 },
  ];

  const projectStatus = [
    { status: 'Completed', count: 45, percentage: 45 },
    { status: 'In Progress', count: 32, percentage: 32 },
    { status: 'Planning', count: 18, percentage: 18 },
    { status: 'On Hold', count: 5, percentage: 5 },
  ];

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual API endpoints
      const mockStats = {
        totalUsers: 156,
        totalArtists: 89,
        totalBookings: 423,
        totalProjects: 67,
        revenueThisMonth: 67000,
        revenueGrowth: 12.5,
        averageRating: 4.7,
        completionRate: 89.2,
      };

      const mockArtists = [
        {
          id: '1',
          name: 'Marcus Johnson',
          stageName: 'M-Jay',
          totalEarnings: 15400,
          totalBookings: 28,
          rating: 4.9,
          genres: ['Hip Hop', 'R&B'],
          verificationStatus: 'VERIFIED',
        },
        {
          id: '2',
          name: 'Sarah Williams',
          stageName: 'Savy',
          totalEarnings: 12800,
          totalBookings: 22,
          rating: 4.8,
          genres: ['Pop', 'R&B'],
          verificationStatus: 'VERIFIED',
        },
        {
          id: '3',
          name: 'David Chen',
          totalEarnings: 9600,
          totalBookings: 18,
          rating: 4.6,
          genres: ['Electronic', 'Pop'],
          verificationStatus: 'PENDING',
        },
      ];

      const mockBookings = [
        {
          id: '1',
          title: 'Album Recording Session',
          artist: { name: 'Marcus Johnson' },
          project: { name: 'Summer Vibes EP' },
          startDate: '2024-01-15T10:00:00Z',
          status: 'IN_PROGRESS',
          finalPrice: 2500,
        },
        {
          id: '2',
          title: 'Mixing & Mastering',
          artist: { name: 'Sarah Williams' },
          startDate: '2024-01-16T14:00:00Z',
          status: 'CONFIRMED',
          finalPrice: 800,
        },
      ];

      setStats(mockStats);
      setArtists(mockArtists);
      setRecentBookings(mockBookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Label Dashboard</h1>
              <p className="text-gray-600">Overview of your music label operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2 inline" />
                Export Report
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Artists"
            value={stats.totalArtists}
            change={8.2}
            color="bg-blue-600"
          />
          <StatCard
            icon={Calendar}
            title="Total Bookings"
            value={stats.totalBookings}
            change={15.3}
            color="bg-green-600"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            change={stats.revenueGrowth}
            color="bg-yellow-600"
          />
          <StatCard
            icon={Star}
            title="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            change={2.1}
            color="bg-purple-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue & Bookings</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Bookings</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Genre Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Genre Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                >
                  {genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Artists and Bookings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Artists */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Artists</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {artists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {artist.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {artist.stageName || artist.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {artist.totalBookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${artist.totalEarnings.toLocaleString()}
                    </p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{artist.rating}</span>
                      {artist.verificationStatus === 'VERIFIED' && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.title}</p>
                    <p className="text-sm text-gray-600">
                      {booking.artist.name} • {booking.project?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                    {booking.finalPrice && (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ${booking.finalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Status Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {projectStatus.map((status, index) => (
              <div key={status.status} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 ${
                  ['bg-green-600', 'bg-blue-600', 'bg-yellow-600', 'bg-gray-600'][index]
                }`}>
                  {status.count}
                </div>
                <p className="font-medium text-gray-900">{status.status}</p>
                <p className="text-sm text-gray-600">{status.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Create New Project</p>
            <p className="text-sm opacity-90">Start a new music project</p>
          </button>
          
          <button className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Add Artists</p>
            <p className="text-sm opacity-90">Onboard new talent</p>
          </button>
          
          <button className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Bulk Booking</p>
            <p className="text-sm opacity-90">Schedule multiple sessions</p>
          </button>
        </div>
      </div>
    </div>
  );
}
