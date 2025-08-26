import React, { useState, useEffect } from 'react';
import { SplitBooking } from '@/lib/types/Booking';
import { getSplitBookingsForUser } from '@/lib/firestore/getSplitBookings';
import { useSplitBookingsForUser } from '@/lib/hooks/useSplitBookingUpdates';
import { SplitBookingCard } from './SplitBookingCard';
import { TalentRequestModal } from '../booking/TalentRequestModal';
import { useAuth } from '@/lib/hooks/useAuth';
import { Users, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

interface SplitBookingsListProps {
  limit?: number;
  showHeader?: boolean;
  onCreateNew?: () => void;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_session', label: 'In Session' },
  { value: 'completed', label: 'Completed' }
];

export function SplitBookingsList({ limit, showHeader = true, onCreateNew }: SplitBookingsListProps) {
  const { user } = useAuth();
  const { bookings, loading, error } = useSplitBookingsForUser();
  const [statusFilter, setStatusFilter] = useState('all');
  const [talentModalOpen, setTalentModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedTalentRole, setSelectedTalentRole] = useState<'artist' | 'producer' | 'engineer' | null>(null);

  useEffect(() => {
    // Component now uses the real-time hook, no need for manual loading
  }, []);

  const loadBookings = async () => {
    // This function is kept for compatibility but bookings are now loaded via the hook
    console.log('Bookings are loaded via real-time hook');
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const displayedBookings = limit ? filteredBookings.slice(0, limit) : filteredBookings;

  const handleViewDetails = (bookingId: string) => {
    // Navigate to booking details page
    // This would typically use Next.js router
    console.log('View booking details:', bookingId);
  };

  const handlePayNow = (bookingId: string) => {
    // Navigate to payment page or open Stripe checkout
    console.log('Pay for booking:', bookingId);
  };

  const handleCancelBooking = (bookingId: string) => {
    // Show confirmation modal and cancel booking
    console.log('Cancel booking:', bookingId);
  };

  const handleTalentRequest = (bookingId: string, role: 'artist' | 'producer' | 'engineer') => {
    setSelectedBookingId(bookingId);
    setSelectedTalentRole(role);
    setTalentModalOpen(true);
  };

  const handleTalentResponse = (response: 'accepted' | 'rejected') => {
    // Bookings will update automatically via real-time hook
    console.log('Talent response submitted:', response);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to view your split bookings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Split Studio Sessions
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_FILTERS.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Create New Button */}
            <button
              onClick={onCreateNew}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Split Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {!limit && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Confirmed</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadBookings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No split sessions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {statusFilter === 'all' 
              ? "You haven't created or joined any split studio sessions yet."
              : `No ${statusFilter} split sessions found.`
            }
          </p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create Your First Split Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((booking) => (
            <SplitBookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={handleViewDetails}
              onPayNow={handlePayNow}
              onCancelBooking={handleCancelBooking}
            />
          ))}
          
          {/* Show more link if limited */}
          {limit && filteredBookings.length > limit && (
            <div className="text-center pt-4">
              <Link
                href="/dashboard/bookings/split"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View all {filteredBookings.length} split sessions →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Talent Request Modal */}
      {talentModalOpen && selectedBookingId && selectedTalentRole && (
        <TalentRequestModal
          isOpen={talentModalOpen}
          onClose={() => {
            setTalentModalOpen(false);
            setSelectedBookingId(null);
            setSelectedTalentRole(null);
          }}
          bookingId={selectedBookingId}
          talentRole={selectedTalentRole}
          onResponseSubmitted={handleTalentResponse}
        />
      )}
    </div>
  );
}
