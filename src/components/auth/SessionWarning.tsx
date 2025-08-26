'use client';

import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SessionWarning() {
  const { sessionStatus, showWarning, extendSession } = useSession();
  const { user } = useAuth();

  if (!user || !showWarning || !sessionStatus.timeUntilExpiry) {
    return null;
  }

  const minutesLeft = Math.ceil(sessionStatus.timeUntilExpiry / 60000);

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Your session will expire in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}. 
            Extend your session to continue working.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={extendSession}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Extend Session
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Session indicator component for dashboard
 */
export function SessionIndicator() {
  const { sessionStatus } = useSession();
  const { user } = useAuth();

  if (!user || !sessionStatus.isValid) {
    return null;
  }

  const expiryTime = sessionStatus.expiresAt ? sessionStatus.expiresAt.toLocaleTimeString() : 'Unknown';
  const isExpiringSoon = sessionStatus.timeUntilExpiry ? sessionStatus.timeUntilExpiry < 30 * 60 * 1000 : false; // 30 minutes

  return (
    <div className="flex items-center text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full mr-2 ${isExpiringSoon ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
      <span>Session expires at {expiryTime}</span>
    </div>
  );
}