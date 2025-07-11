'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CollabBooking } from '@/lib/types/CollabPackage';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Calendar, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SCHEMA_FIELDS } from '../../../lib/SCHEMA_FIELDS';

interface MyCollabBookingsProps {
  view?: 'creator' | 'client' | 'all';
}

export default function MyCollabBookings({ view = 'all' }: MyCollabBookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CollabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const constraints = [orderBy('createdAt', 'desc')];

    if (view === 'creator') {
      // Bookings where user is a member of the collab package
      constraints.unshift(where('packageMembers', 'array-contains', user.uid));
    } else if (view === 'client') {
      // Bookings where user is the client
      constraints.unshift(where('clientId', '==', user.uid));
    } else {
      // All bookings related to the user
      // Note: Firestore doesn't support OR queries directly, so we'll filter client-side
    }

    const q = query(collection(db, 'collabBookings'), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CollabBooking[];

      // Filter for 'all' view client-side
      const filteredBookings = view === 'all' 
        ? bookingsData.filter(booking => 
            booking.clientId === user.uid || 
            booking.packageMembers.includes(user.uid)
          )
        : bookingsData;

      setBookings(filteredBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, view]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (!user) return;

    try {
      setUpdating(bookingId);
      const bookingRef = doc(db, 'collabBookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const isCreatorView = (booking: CollabBooking) => {
    return booking.packageMembers.includes(user?.uid || '');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-40 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Collab Bookings Yet</h3>
        <p className="text-gray-500 mb-6">
          {view === 'creator' 
            ? 'No one has booked your collab packages yet.'
            : view === 'client'
            ? 'You haven\'t booked any collab packages yet.'
            : 'You don\'t have any collab bookings yet.'
          }
        </p>
        <Link
          href="/collabs/explore"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Collab Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {view === 'creator' ? 'My Collab Bookings (as Creator)' : 
         view === 'client' ? 'My Collab Bookings (as Client)' : 
         'All Collab Bookings'}
      </h2>

      {bookings.map((booking) => {
        const isCreator = isCreatorView(booking);
        const userRevenue = isCreator ? booking.revenueDistribution.find(r => r.userId === user?.uid) : null;

        return (
          <div key={booking.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{booking.packageTitle}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {isCreator ? `Client: ${booking.clientEmail}` : `Booked with ${booking.packageMembers.length} creators`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(booking.scheduledDate).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {booking.scheduledTime}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {booking.packageMembers.length} creators
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                ${booking.totalAmount}
                {isCreator && userRevenue && (
                  <span className="ml-1 text-green-600 font-medium">
                    (${userRevenue.amount} for you)
                  </span>
                )}
              </div>
            </div>

            {booking.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Notes:</span> {booking.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Booked {new Date(booking.createdAt).toLocaleDateString()}
              </div>

              {isCreator && booking.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                    disabled={updating === booking.id}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    disabled={updating === booking.id}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <Link
                  href={`/dashboard/bookings/${booking.id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
