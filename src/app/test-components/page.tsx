'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { initializeSampleData } from '@/lib/dev/sampleData';
import BookingInbox from '@/components/dashboard/BookingInbox';
import NotificationBell from '@/components/ui/NotificationBell';

export default function TestComponentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateSampleData = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await initializeSampleData(user.uid);
      setMessage('✅ Sample data created successfully! Refresh the page to see updates.');
    } catch (error) {
      setMessage('❌ Error creating sample data. Check console for details.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Components</h1>
          <p className="text-gray-600">Please log in to test the components</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Header with Notification Bell */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Component Testing</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">User: {user.email}</span>
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Test Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleCreateSampleData}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Sample Data'}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                This will create sample notifications, bookings, and message threads for testing.
              </p>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Component Demos */}
        <div className="space-y-8">
          {/* Notification Bell Demo */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Bell Component</h2>
            <p className="text-gray-600 mb-4">
              The notification bell is displayed in the header above. Click it to see the dropdown with notifications.
            </p>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Component:</span>
              <NotificationBell />
              <span className="text-sm text-gray-500">← Click the bell to test</span>
            </div>
          </div>

          {/* Booking Inbox Demo */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Inbox Component</h2>
            <p className="text-gray-600 mb-4">
              The booking inbox shows all user bookings and messages in one unified view.
            </p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <BookingInbox />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/dashboard/inbox"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">Dashboard Inbox</div>
              <div className="text-sm text-blue-600">View the full inbox page</div>
            </a>
            <a
              href="/dashboard/notifications"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">Notifications Page</div>
              <div className="text-sm text-blue-600">View all notifications</div>
            </a>
            <a
              href="/dashboard/home"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">Dashboard Home</div>
              <div className="text-sm text-blue-600">Return to dashboard</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
