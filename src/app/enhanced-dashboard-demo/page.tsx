'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Star, 
  Target,
  Activity,
  BarChart3,
  Eye,
  Download,
  Clock,
  Award
} from 'lucide-react';

// Import the new Phase 4 components
import { StatsCard, AnimatedChart, MetricDisplay } from '@/components/dashboard';
import { AnimatedMetric, ProgressRing, TrendIndicator } from '@/components/analytics';

const EnhancedDashboardDemo: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Sample data for demonstrations
  const statsData = [
    {
      title: 'Total Revenue',
      value: 24500,
      icon: DollarSign,
      change: 12.5,
      changeLabel: 'vs last month',
      color: 'green' as const,
      format: 'currency' as const,
      showProgress: true,
      progress: 75,
    },
    {
      title: 'Active Users',
      value: 1340,
      icon: Users,
      change: -2.3,
      changeLabel: 'vs last week',
      color: 'blue' as const,
      format: 'number' as const,
      showProgress: true,
      progress: 85,
    },
    {
      title: 'Conversion Rate',
      value: 3.2,
      icon: TrendingUp,
      change: 0.8,
      changeLabel: 'vs last month',
      color: 'purple' as const,
      format: 'percentage' as const,
      suffix: '%',
      showProgress: true,
      progress: 64,
    },
    {
      title: 'Avg Session Time',
      value: 145,
      icon: Clock,
      change: 15.2,
      changeLabel: 'vs last week',
      color: 'orange' as const,
      format: 'duration' as const,
      showProgress: true,
      progress: 58,
    },
  ];

  const chartData = [
    { name: 'Jan', revenue: 4000, users: 240 },
    { name: 'Feb', revenue: 3000, users: 139 },
    { name: 'Mar', revenue: 2000, users: 980 },
    { name: 'Apr', revenue: 2780, users: 390 },
    { name: 'May', revenue: 1890, users: 480 },
    { name: 'Jun', revenue: 2390, users: 380 },
    { name: 'Jul', revenue: 3490, users: 430 },
  ];

  const pieData = [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 35 },
    { name: 'Tablet', value: 20 },
  ];

  const metricsData = [
    {
      label: 'Revenue Goal',
      value: 24500,
      target: 30000,
      format: 'currency' as const,
      trend: 12.5,
      trendLabel: 'vs last month',
    },
    {
      label: 'User Acquisition',
      value: 342,
      target: 500,
      format: 'number' as const,
      trend: -5.2,
      trendLabel: 'vs target',
    },
    {
      label: 'Customer Satisfaction',
      value: 4.8,
      target: 5.0,
      format: 'number' as const,
      unit: '/5',
      trend: 2.1,
      trendLabel: 'improvement',
    },
  ];

  const progressRings = [
    { label: 'Sales Target', value: 75, max: 100, color: 'green' as const, icon: Target },
    { label: 'User Engagement', value: 82, max: 100, color: 'blue' as const, icon: Activity },
    { label: 'Quality Score', value: 94, max: 100, color: 'purple' as const, icon: Star },
    { label: 'Completion Rate', value: 67, max: 100, color: 'orange' as const, icon: Award },
  ];

  const trendData = [
    { label: 'Monthly Revenue', current: 24500, previous: 21800, format: 'currency' as const },
    { label: 'New Customers', current: 156, previous: 142, format: 'number' as const },
    { label: 'Bounce Rate', current: 23.4, previous: 28.1, format: 'percentage' as const, colorScheme: 'inverse' as const },
    { label: 'Page Views', current: 12450, previous: 11200, format: 'number' as const },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'metrics', label: 'Metrics', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Enhanced Dashboard Components</h1>
          <p className="text-xl text-gray-400 mb-8">
            Phase 4: Data Visualization - Showcasing animated dashboard and analytics components
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="flex bg-neutral-800/50 rounded-lg p-1 backdrop-blur-sm border border-neutral-700/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 ${
                    selectedTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-neutral-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Enhanced Stats Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsData.map((stat, index) => (
                    <StatsCard
                      key={stat.title}
                      {...stat}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </section>

              {/* Charts */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Animated Charts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedChart
                    type="area"
                    data={chartData}
                    dataKey="revenue"
                    title="Revenue Trend"
                    height={300}
                    gradient={true}
                    delay={200}
                  />
                  <AnimatedChart
                    type="bar"
                    data={chartData}
                    dataKey="users"
                    title="User Growth"
                    height={300}
                    colors={['#10B981']}
                    delay={400}
                  />
                </div>
                <div className="mt-6">
                  <AnimatedChart
                    type="donut"
                    data={pieData}
                    title="Traffic Sources"
                    height={300}
                    delay={600}
                  />
                </div>
              </section>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-8">
              {/* Animated Metrics */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Animated Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatedMetric
                    label="Total Revenue"
                    value={24500}
                    previousValue={21800}
                    target={30000}
                    format="currency"
                    color="green"
                    showProgress={true}
                    showTarget={true}
                    icon={DollarSign}
                    delay={0}
                  />
                  <AnimatedMetric
                    label="Active Users"
                    value={1340}
                    previousValue={1450}
                    format="number"
                    color="blue"
                    showTrend={true}
                    icon={Users}
                    delay={200}
                  />
                  <AnimatedMetric
                    label="Conversion Rate"
                    value={3.2}
                    previousValue={2.8}
                    format="percentage"
                    color="purple"
                    showTrend={true}
                    icon={TrendingUp}
                    delay={400}
                  />
                </div>
              </section>

              {/* Progress Rings */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Progress Rings</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {progressRings.map((ring, index) => (
                    <div key={ring.label} className="flex flex-col items-center">
                      <ProgressRing
                        value={ring.value}
                        max={ring.max}
                        color={ring.color}
                        icon={ring.icon}
                        size={120}
                        delay={index * 150}
                        showValue={true}
                        showPercentage={true}
                        gradient={true}
                        glow={true}
                        interactive={true}
                      />
                      <p className="mt-3 text-sm font-medium text-gray-300 text-center">
                        {ring.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trend Indicators */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Trend Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trendData.map((trend, index) => (
                    <TrendIndicator
                      key={trend.label}
                      {...trend}
                      variant="detailed"
                      showChange={true}
                      showPercentage={true}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {selectedTab === 'metrics' && (
            <div className="space-y-8">
              {/* Metric Display */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Metric Display</h2>
                <MetricDisplay
                  title="Performance Metrics"
                  metrics={metricsData}
                  layout="grid"
                  showProgress={true}
                  showTrends={true}
                  showTargets={true}
                  animate={true}
                />
              </section>

              {/* Compact Layout */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Compact Metrics</h2>
                <MetricDisplay
                  metrics={metricsData}
                  layout="compact"
                  size="sm"
                  variant="minimal"
                  animate={true}
                  delay={200}
                />
              </section>

              {/* List Layout */}
              <section>
                <h2 className="text-2xl font-bold mb-6">List Metrics</h2>
                <div className="max-w-md">
                  <MetricDisplay
                    metrics={metricsData}
                    layout="list"
                    size="md"
                    showProgress={true}
                    showTrends={true}
                    animate={true}
                    delay={400}
                  />
                </div>
              </section>
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center border-t border-neutral-800 pt-8"
        >
          <p className="text-gray-400">
            Phase 4 Implementation: Enhanced Dashboard Components with animations, progress tracking, and interactive visualizations.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            All components are responsive, accessible, and optimized for performance.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboardDemo;