'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface CalendarInfo {
  name: string;
  timezone: string;
}

interface CalendarSyncProps {
  onSyncComplete?: () => void;
}

export default function CalendarSync({ onSyncComplete }: CalendarSyncProps) {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [calendarInfo, setCalendarInfo] = useState<CalendarInfo | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCalendarInfo();
    }
  }, [session]);

  const fetchCalendarInfo = async () => {
    try {
      const response = await fetch('/api/calendar/sync');
      if (response.ok) {
        const info = await response.json();
        setCalendarInfo(info);
      }
    } catch (error) {
      console.error('Failed to fetch calendar info:', error);
    }
  };

  const handleSync = async () => {
    if (!session?.accessToken) {
      toast.error('Please sign in with Google to sync calendar');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Calendar synced successfully!');
        setLastSync(new Date().toISOString());
        onSyncComplete?.();
      } else {
        const error = await response.json();
        toast.error(`Sync failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync calendar. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handlePushAvailability = async () => {
    if (!session?.accessToken) {
      toast.error('Please sign in with Google to push availability');
      return;
    }

    setPushing(true);
    try {
      // Get current availability from database
      const availabilityResponse = await fetch(`/api/availability/${session.user.id}`);
      if (!availabilityResponse.ok) {
        throw new Error('Failed to get availability');
      }
      
      const availability = await availabilityResponse.json();
      
      // Convert to calendar slots format
      const slots = availability.slots || [];
      
      const response = await fetch('/api/calendar/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slots }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Availability pushed to calendar!');
      } else {
        const error = await response.json();
        toast.error(`Push failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Push error:', error);
      toast.error('Failed to push availability. Please try again.');
    } finally {
      setPushing(false);
    }
  };

  if (!session?.accessToken) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Google Calendar Integration
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Sign in with Google to enable two-way calendar synchronization
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Google Calendar Sync</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-500">Connected</span>
        </div>
      </div>

      {calendarInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Calendar:</strong> {calendarInfo.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Timezone:</strong> {calendarInfo.timezone}
          </p>
          {lastSync && (
            <p className="text-sm text-gray-600">
              <strong>Last Sync:</strong> {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Import from Google Calendar</h4>
          <p className="text-sm text-gray-500 mb-3">
            Sync your existing Google Calendar events to mark busy times automatically
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              'Sync from Google Calendar'
            )}
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Export to Google Calendar</h4>
          <p className="text-sm text-gray-500 mb-3">
            Push your availability slots to Google Calendar as bookable time blocks
          </p>
          <button
            onClick={handlePushAvailability}
            disabled={pushing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pushing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Pushing...
              </>
            ) : (
              'Push to Google Calendar'
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Import:</strong> Existing calendar events mark you as busy</li>
          <li>• <strong>Export:</strong> Your availability appears as bookable time blocks</li>
          <li>• <strong>Real-time:</strong> Changes sync automatically when you update either calendar</li>
        </ul>
      </div>
    </div>
  );
}