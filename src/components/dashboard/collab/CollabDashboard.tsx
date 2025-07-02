'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import MyCollabPackages from '@/components/dashboard/collab/MyCollabPackages';
import MyCollabBookings from '@/components/dashboard/collab/MyCollabBookings';
import { Users, Package, Calendar, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

type TabType = 'overview' | 'packages' | 'bookings-as-creator' | 'bookings-as-client';

export default function CollabDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
    { id: 'packages' as TabType, label: 'My Packages', icon: Package },
    { id: 'bookings-as-creator' as TabType, label: 'Creator Bookings', icon: Users },
    { id: 'bookings-as-client' as TabType, label: 'Client Bookings', icon: Calendar },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Packages</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Collaborators</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">$0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/collabs/create"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                      Create Collab Package
                    </p>
                  </div>
                </Link>
                <Link
                  href="/collabs/explore"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                >
                  <div className="text-center">
                    <Users className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">
                      Explore Collabs
                    </p>
                  </div>
                </Link>
                <Link
                  href="/collabs"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                >
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">
                      View All Collabs
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent collab activity</p>
                <p className="text-sm">Create your first collab package to get started!</p>
              </div>
            </div>
          </div>
        );

      case 'packages':
        return <MyCollabPackages />;

      case 'bookings-as-creator':
        return <MyCollabBookings view="creator" />;

      case 'bookings-as-client':
        return <MyCollabBookings view="client" />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Collaboration Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your collab packages, bookings, and collaborations
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
