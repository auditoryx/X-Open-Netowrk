import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../src/context/AuthContext';
import { useEarningsData } from '../../../hooks/useEarningsData';
import EarningsChart from '../../../components/admin/EarningsChart';
import TopRolesCard from '../../../components/admin/TopRolesCard';
import { formatCurrency } from '../../../lib/utils/formatCurrency';

type PeriodType = 'weekly' | 'monthly';

export default function AdminEarningsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const {
    data: earningsData,
    loading: dataLoading,
    error: dataError,
    refetch
  } = useEarningsData(period);

  // Check admin authorization
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [user, authLoading, router]);

  // Don't render anything until auth check is complete
  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Earnings Data</h3>
            <p className="text-red-600 mb-4">{dataError}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalEarnings = earningsData?.totalRevenue || 0;
  const totalCommission = earningsData?.totalCommission || 0;
  const totalBookings = earningsData?.totalBookings || 0;
  const commissionRate = totalEarnings > 0 ? (totalCommission / totalEarnings) * 100 : 20;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Earnings Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Platform revenue overview and booking insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    period === 'weekly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    period === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
              </div>
              <button
                onClick={() => refetch()}
                disabled={dataLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {dataLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading earnings data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Platform Commission</dt>
                      <dd className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommission)}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                      <dd className="text-2xl font-bold text-gray-900">{totalBookings.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Commission Rate</dt>
                      <dd className="text-2xl font-bold text-gray-900">{commissionRate.toFixed(1)}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Revenue Trends ({period === 'weekly' ? 'Weekly' : 'Monthly'})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Platform commission and total revenue over time
                    </p>
                  </div>
                  <div className="p-6">
                    {earningsData ? (
                      <EarningsChart data={earningsData} period={period} />
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Roles and Cities */}
              <div className="space-y-6">
                <TopRolesCard
                  title="Top Roles by Revenue"
                  data={earningsData?.topRoles || []}
                  type="roles"
                />
                <TopRolesCard
                  title="Top Cities by Bookings"
                  data={earningsData?.topCities || []}
                  type="cities"
                />
              </div>
            </div>

            {/* Empty State */}
            {!dataLoading && (!earningsData || totalBookings === 0) && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings data available</h3>
                <p className="text-gray-500 mb-4">
                  There are no completed bookings to display. Once users start booking and completing sessions, 
                  the earnings data will appear here.
                </p>
                <button
                  onClick={() => refetch()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
