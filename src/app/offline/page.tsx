'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  RefreshCw, 
  Users, 
  MessageSquare, 
  Calendar,
  Bookmark,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { pwaService } from '@/lib/services/pwaService';

interface OfflineData {
  creators: any[];
  bookings: any[];
  messages: any[];
  savedSearches: string[];
  lastSync: Date;
}

const OfflinePage = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const data = localStorage.getItem('auditoryx-offline-data');
      if (data) {
        setOfflineData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Try to fetch a simple endpoint to test connectivity
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache' 
      });
      
      if (response.ok) {
        // Connection restored, redirect to home
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Offline Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <WifiOff className="w-10 h-10 text-gray-600" />
          </motion.div>

          {/* Offline Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              You're Offline
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              No internet connection detected. But don't worry - you can still access some features!
            </p>
            {isOnline && (
              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connection restored
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Checking...' : 'Try Again'}
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go to Home
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>

          {/* Offline Features Available */}
          {offlineData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-t border-gray-200 pt-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Available Offline
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Cached Creators */}
                {offlineData.creators && offlineData.creators.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 text-left">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Cached Creators</span>
                    </div>
                    <div className="text-blue-700 text-sm">
                      {offlineData.creators.length} creators available offline
                    </div>
                  </div>
                )}

                {/* Draft Bookings */}
                {offlineData.bookings && offlineData.bookings.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 text-left">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Draft Bookings</span>
                    </div>
                    <div className="text-green-700 text-sm">
                      {offlineData.bookings.length} bookings ready to sync
                    </div>
                  </div>
                )}

                {/* Draft Messages */}
                {offlineData.messages && offlineData.messages.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4 text-left">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-900">Draft Messages</span>
                    </div>
                    <div className="text-purple-700 text-sm">
                      {offlineData.messages.length} messages ready to send
                    </div>
                  </div>
                )}

                {/* Saved Searches */}
                {offlineData.savedSearches && offlineData.savedSearches.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 text-left">
                    <div className="flex items-center mb-2">
                      <Bookmark className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-900">Saved Searches</span>
                    </div>
                    <div className="text-yellow-700 text-sm">
                      {offlineData.savedSearches.length} saved searches available
                    </div>
                  </div>
                )}
              </div>

              {/* Last Sync Info */}
              {offlineData.lastSync && (
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Last synced: {new Date(offlineData.lastSync).toLocaleString()}
                </div>
              )}
            </motion.div>
          )}

          {/* Tips for Offline Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-t border-gray-200 pt-8 text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-4">What you can do offline:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Browse cached creator profiles and portfolios</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Create draft bookings that will sync when online</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Compose messages to send later</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Review your saved searches and preferences</span>
              </li>
            </ul>
          </motion.div>

          {/* PWA Installation Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
          >
            <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Install AuditoryX as an app on your device for better offline experience and faster access to your content.
            </p>
          </motion.div>
        </motion.div>

        {/* Network Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`mt-4 text-center text-sm ${
            isOnline ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            {isOnline ? 'Connected to internet' : 'No internet connection'}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OfflinePage;
