import React, { useState, useEffect } from 'react';
import { updateTalentResponse } from '@/lib/firestore/requestTalentForBooking';
import { getSplitBookingById } from '@/lib/firestore/getSplitBookings';
import { useAuth } from '@/lib/hooks/useAuth';
import { X, Music, Headphones, Mic, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { SplitBooking } from '@/lib/types/Booking';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TalentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  talentRole: 'artist' | 'producer' | 'engineer';
  onResponseSubmitted?: (response: 'accepted' | 'rejected') => void;
}

const ROLE_ICONS = {
  artist: Music,
  producer: Headphones,
  engineer: Mic
};

const ROLE_LABELS = {
  artist: 'Artist',
  producer: 'Producer',
  engineer: 'Audio Engineer'
};

export function TalentRequestModal({ 
  isOpen, 
  onClose, 
  bookingId, 
  talentRole, 
  onResponseSubmitted 
}: TalentRequestModalProps) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<SplitBooking | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const RoleIcon = ROLE_ICONS[talentRole];

  useEffect(() => {
    if (isOpen && bookingId) {
      loadBookingDetails();
    }
  }, [isOpen, bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingData = await getSplitBookingById(bookingId);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error loading booking details:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response: 'accepted' | 'rejected') => {
    if (!user || !booking) {
      toast.error('Unable to submit response');
      return;
    }

    setSubmitting(true);
    try {
      await updateTalentResponse(
        bookingId,
        user.uid,
        talentRole,
        response,
        message.trim() || undefined
      );

      toast.success(
        response === 'accepted' 
          ? 'Session request accepted!' 
          : 'Session request declined'
      );

      onResponseSubmitted?.(response);
      onClose();
    } catch (error) {
      console.error('Error submitting talent response:', error);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'EEEE, MMMM do, yyyy \'at\' h:mm a');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <RoleIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Session Request - {ROLE_LABELS[talentRole]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          ) : booking ? (
            <>
              {/* Session Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Session Details
                </h3>
                
                {booking.sessionTitle && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Title:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.sessionTitle}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Date & Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDateTime(booking.scheduledAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.durationMinutes} minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Studio</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.studioName || 'Studio TBD'}
                      </p>
                      {booking.studioLocation && (
                        <p className="text-xs text-gray-500">{booking.studioLocation}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Session Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Split Collaboration
                      </p>
                    </div>
                  </div>
                </div>

                {booking.sessionDescription && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description:</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {booking.sessionDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Request Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message to your response..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/300 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleResponse('accepted')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Accept Request'}
                </button>
                <button
                  onClick={() => handleResponse('rejected')}
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Decline Request'}
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                You'll be notified of any updates to this session
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Unable to load session details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
