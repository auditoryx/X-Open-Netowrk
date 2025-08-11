'use client';

import React, { useState, useEffect } from 'react';

interface SecurityEvent {
  type: 'ddos_attempt' | 'rate_limit_exceeded' | 'suspicious_activity';
  ip: string;
  userAgent: string;
  timestamp: number;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TrafficMetrics {
  totalRequests: number;
  uniqueIPs: number;
  suspiciousActivity: number;
  blockedRequests: number;
}

const RateLimitDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<TrafficMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent security events
      const eventsResponse = await fetch('/api/monitoring?action=events&limit=50');
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch security events');
      }
      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events || []);

      // Fetch traffic metrics
      const metricsResponse = await fetch('/api/monitoring?action=metrics');
      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch traffic metrics');
      }
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-semibold">Error loading dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rate Limiting & Security Dashboard</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Traffic Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Requests (1h)</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalRequests}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Unique IPs</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.uniqueIPs}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Suspicious Activity</h3>
            <p className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivity}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Blocked Requests</h3>
            <p className="text-2xl font-bold text-red-600">{metrics.blockedRequests}</p>
          </div>
        </div>
      )}

      {/* Rate Limit Configuration */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Current Rate Limit Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded">
            <h4 className="font-medium text-gray-900">Authentication</h4>
            <p className="text-sm text-gray-600">5 requests/minute</p>
          </div>
          <div className="p-4 border rounded">
            <h4 className="font-medium text-gray-900">API Endpoints</h4>
            <p className="text-sm text-gray-600">100 requests/minute/user</p>
          </div>
          <div className="p-4 border rounded">
            <h4 className="font-medium text-gray-900">Public Endpoints</h4>
            <p className="text-sm text-gray-600">20 requests/minute/IP</p>
          </div>
          <div className="p-4 border rounded">
            <h4 className="font-medium text-gray-900">Admin Endpoints</h4>
            <p className="text-sm text-gray-600">50 requests/minute/admin</p>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Security Events</h2>
          <p className="text-sm text-gray-600">Last 50 events</p>
        </div>
        
        {events.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No security events recorded
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {event.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={JSON.stringify(event.details)}>
                        {typeof event.details === 'object' 
                          ? JSON.stringify(event.details).slice(0, 100) + '...'
                          : event.details
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Rate Limiting Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">DDoS Protection Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Security Monitoring Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitDashboard;