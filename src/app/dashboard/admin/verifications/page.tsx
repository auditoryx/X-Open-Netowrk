'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAllVerifications } from '@/lib/firestore/updateVerificationStatus';
import { VerificationRequest } from '@/lib/firestore/submitVerificationRequest';
import VerificationReviewCard from '@/components/admin/VerificationReviewCard';
import withAdminProtection from '@/src/middleware/withAdminProtection';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

function AdminVerificationsPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch verifications
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const allVerifications = await getAllVerifications();
      setVerifications(allVerifications);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVerifications();
    }
  }, [user]);

  // Filter and search verifications
  useEffect(() => {
    let filtered = verifications;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(v => v.status === filter);
    }

    // Search by name, role, or user ID
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.role.toLowerCase().includes(query) ||
        v.userId.toLowerCase().includes(query) ||
        v.statement.toLowerCase().includes(query)
      );
    }

    setFilteredVerifications(filtered);
  }, [verifications, filter, searchQuery]);

  const handleStatusUpdate = (userId: string, newStatus: 'approved' | 'rejected') => {
    setVerifications(prev => 
      prev.map(v => 
        v.userId === userId 
          ? { ...v, status: newStatus, updatedAt: new Date() as any }
          : v
      )
    );
  };

  const getStatusCounts = () => {
    return {
      total: verifications.length,
      pending: verifications.filter(v => v.status === 'pending').length,
      approved: verifications.filter(v => v.status === 'approved').length,
      rejected: verifications.filter(v => v.status === 'rejected').length
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
              <p className="text-gray-600 mt-1">Review and manage user verification requests</p>
            </div>
            <button
              onClick={fetchVerifications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, role, user ID, or statement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending ({counts.pending})</option>
                <option value="approved">Approved ({counts.approved})</option>
                <option value="rejected">Rejected ({counts.rejected})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verification Cards */}
        <div className="space-y-6">
          {filteredVerifications.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filter !== 'pending' 
                  ? 'No matching verification requests' 
                  : 'No pending verification requests'
                }
              </h3>
              <p className="text-gray-500">
                {searchQuery || filter !== 'pending'
                  ? 'Try adjusting your search or filter criteria'
                  : 'All verification requests have been processed'
                }
              </p>
            </div>
          ) : (
            filteredVerifications.map((verification) => (
              <VerificationReviewCard
                key={verification.userId}
                verification={verification}
                onStatusUpdate={handleStatusUpdate}
                adminUserId={user.uid}
              />
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredVerifications.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredVerifications.length} of {verifications.length} verification requests
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminProtection(AdminVerificationsPage, { allowModerators: true });
