'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserBookings, getUserBookingStats, UserBooking } from '@/lib/firestore/getUserBookings';
import { useAuth } from '@/lib/hooks/useAuth';

interface BookingsPreviewProps {
  role?: 'client' | 'provider' | 'both';
  limit?: number;
}

export default function BookingsPreview({ role = 'both', limit = 5 }: BookingsPreviewProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [bookingsData, statsData] = await Promise.all([
          getUserBookings(user.uid, role, limit),
          getUserBookingStats(user.uid, role)
        ]);
        
        setBookings(bookingsData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.uid, role, limit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'accepted': return 'text-blue-400 bg-blue-400/10';
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Bookings</h3>
        <Link 
          href="/dashboard/bookings"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{stats.active}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400">Done</div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📅</div>
          <p className="text-gray-400">No bookings yet</p>
          <Link 
            href="/explore"
            className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
          >
            Browse creators
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/booking/${booking.id}`}
              className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white truncate">
                      {booking.serviceTitle}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {role === 'client' ? `with ${booking.providerName}` : `by ${booking.clientName}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(booking.bookingDate)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    ${booking.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
