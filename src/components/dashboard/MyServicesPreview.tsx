'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserServices, getUserServiceStats, UserService } from '@/lib/firestore/getUserServices';
import { useAuth } from '@/lib/hooks/useAuth';

interface MyServicesPreviewProps {
  limit?: number;
}

export default function MyServicesPreview({ limit = 4 }: MyServicesPreviewProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<UserService[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchServices = async () => {
      try {
        setLoading(true);
        const [servicesData, statsData] = await Promise.all([
          getUserServices(user.uid, limit),
          getUserServiceStats(user.uid)
        ]);
        
        setServices(servicesData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user?.uid, limit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'draft': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'paused': return '⏸️';
      case 'draft': return '📝';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">My Services</h3>
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Services</h3>
        <div className="flex items-center space-x-2">
          <Link 
            href="/services/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            + Add Service
          </Link>
          <Link 
            href="/dashboard/services"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{stats.active}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{stats.paused}</div>
          <div className="text-xs text-gray-400">Paused</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-gray-400">{stats.draft}</div>
          <div className="text-xs text-gray-400">Draft</div>
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">🛍️</div>
          <p className="text-gray-400 mb-2">No services created yet</p>
          <Link 
            href="/services/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors inline-block"
          >
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/edit/${service.id}`}
              className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white truncate flex-1">
                  {service.title}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)} {service.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">
                  ${service.price}
                </div>
                <div className="text-xs text-gray-500">
                  {service.category}
                </div>
              </div>
              
              {service.bookingCount !== undefined && (
                <div className="mt-2 text-xs text-gray-500">
                  {service.bookingCount} booking{service.bookingCount !== 1 ? 's' : ''}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
