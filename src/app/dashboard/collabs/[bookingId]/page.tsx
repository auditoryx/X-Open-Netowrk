'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { CollabBooking } from '@/lib/types/CollabPackage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RoleDashboardLayout from '@/components/dashboard/RoleDashboardLayout';
import CollabBookingSummary from '@/components/collab/CollabBookingSummary';
import { Calendar, Clock, Users, DollarSign, MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CollabBookingDetailPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<CollabBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!bookingId || !user) return;

    const fetchBooking = async () => {
      try {
        const bookingRef = doc(db, 'collabBookings', bookingId as string);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          const bookingData = { id: bookingSnap.id, ...bookingSnap.data() } as CollabBooking;
          
          // Verify user has access to this booking
          const hasAccess = bookingData.clientId === user.uid || 
                           bookingData.packageMembers.includes(user.uid);
          
          if (hasAccess) {
            setBooking(bookingData);
          } else {
            // Redirect or show error
            console.error('User does not have access to this booking');
          }
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking || !user) return;

    try {
      setUpdating(true);
      const bookingRef = doc(db, 'collabBookings', booking.id);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setBooking(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const isCreator = booking?.packageMembers.includes(user?.uid || '') || false;
  const isClient = booking?.clientId === user?.uid;

  if (loading) {
    return (
      <RoleDashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </RoleDashboardLayout>
    );
  }

  if (!booking) {
    return (
      <RoleDashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or you don't have access to it.</p>
            <Link
              href="/dashboard/collabs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </RoleDashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const userRevenue = isCreator 
    ? booking.revenueDistribution.find(r => r.userId === user?.uid)
    : null;

  return (
    <RoleDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{booking.packageTitle}</h1>
                <p className="text-gray-600 mt-2">
                  Booking #{booking.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="font-medium">
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Info */}
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Session Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{booking.scheduledTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{booking.durationHours} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">${booking.totalAmount}</p>
                      {userRevenue && (
                        <p className="text-sm text-green-600">Your share: ${userRevenue.amount}</p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium text-gray-900 mb-2">Client Notes</h3>
                    <p className="text-gray-600">{booking.notes}</p>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Team Members</h2>
                <div className="space-y-4">
                  {booking.revenueDistribution.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{member.displayName}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${member.amount}</p>
                        <p className="text-sm text-gray-500">{member.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {isCreator && booking.status === 'pending' && (
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Actions Required</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={updating}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Accept Booking'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updating}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Decline Booking'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  {isClient ? 'Your Booking' : 'Client Information'}
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{booking.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booked on</p>
                    <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Team
                  </button>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={updating}
                      className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Package Link */}
              <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Related Package</h2>
                <Link
                  href={`/collabs/${booking.packageId}`}
                  className="block w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-center"
                >
                  View Package Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
