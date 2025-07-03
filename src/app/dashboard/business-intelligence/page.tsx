'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { revenueOptimizationService, RevenueOptimization, ServiceRecommendation, PricingAnalysis, DemandForecast } from '@/lib/services/revenueOptimizationService';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users,
  Calendar,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Download,
  RefreshCw,
  Eye,
  Heart,
  Star,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'overview' | 'pricing' | 'forecasting' | 'recommendations';

export default function BusinessIntelligencePage() {
  const { user } = useAuth();
  const [optimization, setOptimization] = useState<RevenueOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    loadOptimizationData();
  }, [user]);

  const loadOptimizationData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const data = await revenueOptimizationService.getRevenueOptimization(user.uid);
      setOptimization(data);
    } catch (error) {
      console.error('Error loading optimization data:', error);
      toast.error('Failed to load business intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOptimizationData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!optimization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-600 mb-4">Start taking bookings to see business intelligence insights</p>
          <button
            onClick={loadOptimizationData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
            <p className="text-gray-600 mt-2">Revenue optimization and strategic insights</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'pricing', label: 'Pricing Analysis', icon: DollarSign },
              { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <OverviewSection optimization={optimization} />
        )}
        
        {viewMode === 'pricing' && (
          <PricingAnalysisSection pricingAnalysis={optimization.pricingAnalysis} />
        )}
        
        {viewMode === 'forecasting' && (
          <ForecastingSection demandForecast={optimization.demandForecast} />
        )}
        
        {viewMode === 'recommendations' && (
          <RecommendationsSection recommendations={optimization.recommendations} />
        )}
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ optimization }: { optimization: RevenueOptimization }) {
  const { currentMetrics, opportunities, totalPotential } = optimization;

  const opportunityData = Object.entries(opportunities).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    value,
    color: getOpportunityColor(key)
  }));

  return (
    <div className="space-y-6">
      {/* Current Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={`$${currentMetrics.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${currentMetrics.averageOrderValue.toFixed(0)}`}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(currentMetrics.conversionRate * 100).toFixed(1)}%`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Client Retention"
          value={`${(currentMetrics.clientRetentionRate * 100).toFixed(1)}%`}
          icon={Users}
          color="orange"
        />
        <MetricCard
          title="Profit Margin"
          value={`${(currentMetrics.profitMargin * 100).toFixed(1)}%`}
          icon={BarChart3}
          color="red"
        />
      </div>

      {/* Revenue Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Opportunities</h3>
          <div className="space-y-4">
            {opportunityData.map((opportunity) => (
              <div key={opportunity.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${opportunity.color}-500`}></div>
                  <span className="text-gray-700">{opportunity.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    +${opportunity.value.toLocaleString()}/mo
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Potential</span>
              <span className="text-2xl font-bold text-green-600">
                +${totalPotential.toLocaleString()}/mo
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {((totalPotential / currentMetrics.monthlyRevenue) * 100).toFixed(0)}% increase from current revenue
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={opportunityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {opportunityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorValue(entry.color)} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Potential']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {optimization.recommendations.slice(0, 3).map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

// Pricing Analysis Section
function PricingAnalysisSection({ pricingAnalysis }: { pricingAnalysis: PricingAnalysis[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Pricing Analysis</h3>
        
        <div className="space-y-6">
          {pricingAnalysis.map((analysis) => (
            <PricingAnalysisCard key={analysis.serviceId} analysis={analysis} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Forecasting Section
function ForecastingSection({ demandForecast }: { demandForecast: DemandForecast[] }) {
  const chartData = demandForecast.map(forecast => ({
    period: forecast.period,
    bookings: forecast.predictedBookings,
    revenue: forecast.predictedRevenue,
    confidence: forecast.confidence * 100
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Bookings</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Confidence</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Peak Days</th>
              </tr>
            </thead>
            <tbody>
              {demandForecast.map((forecast) => (
                <tr key={forecast.period} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{forecast.period}</td>
                  <td className="py-3 px-4 text-right">{forecast.predictedBookings}</td>
                  <td className="py-3 px-4 text-right">${forecast.predictedRevenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      forecast.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                      forecast.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(forecast.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {forecast.peakDays.slice(0, 3).map((day) => (
                        <span key={day} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {day}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Recommendations Section
function RecommendationsSection({ recommendations }: { recommendations: ServiceRecommendation[] }) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredRecommendations = recommendations.filter(rec => 
    filter === 'all' || rec.priority === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-600`} />
      </div>
    </div>
  );
}

function PricingAnalysisCard({ analysis }: { analysis: PricingAnalysis }) {
  const priceChange = analysis.suggestedPrice - analysis.currentPrice;
  const isIncrease = priceChange > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{analysis.serviceName}</h4>
          <p className="text-sm text-gray-600">Demand Score: {analysis.demandScore}/100</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          analysis.competitionLevel === 'low' ? 'bg-green-100 text-green-800' :
          analysis.competitionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {analysis.competitionLevel} competition
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Current Price</p>
          <p className="font-semibold">${analysis.currentPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Suggested Price</p>
          <p className={`font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
            ${analysis.suggestedPrice}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Price Change</p>
          <p className={`font-semibold flex items-center gap-1 ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
            {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            ${Math.abs(priceChange)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Revenue Impact</p>
          <p className="font-semibold text-blue-600">
            +${analysis.revenueImpact.increase.toFixed(0)}/mo
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-700">{analysis.reasoning}</p>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, compact = false }: { 
  recommendation: ServiceRecommendation;
  compact?: boolean;
}) {
  const priorityColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const impactIcons = {
    high: TrendingUp,
    medium: Target,
    low: Clock
  };

  const Icon = impactIcons[recommendation.impact];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
            {!compact && (
              <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[recommendation.priority]}`}>
          {recommendation.priority}
        </span>
      </div>

      {!compact && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Effort</p>
              <p className="text-sm font-medium capitalize">{recommendation.effort}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Impact</p>
              <p className="text-sm font-medium capitalize">{recommendation.impact}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Timeframe</p>
              <p className="text-sm font-medium">{recommendation.timeframe}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900 font-medium">Expected Outcome</p>
            <p className="text-sm text-blue-700">
              {recommendation.expectedOutcome.metric}: {recommendation.expectedOutcome.currentValue} → {recommendation.expectedOutcome.projectedValue}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Action Items:</p>
            <ul className="space-y-1">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions
function getOpportunityColor(key: string): string {
  const colors: { [key: string]: string } = {
    pricingOptimization: 'blue',
    serviceExpansion: 'green',
    retentionImprovement: 'purple',
    conversionImprovement: 'orange',
    operationalEfficiency: 'red'
  };
  return colors[key] || 'gray';
}

function getColorValue(color: string): string {
  const colorMap: { [key: string]: string } = {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    orange: '#F59E0B',
    red: '#EF4444',
    gray: '#6B7280'
  };
  return colorMap[color] || colorMap.gray;
}
