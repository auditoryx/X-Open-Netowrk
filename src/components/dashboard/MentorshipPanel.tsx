import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserMentorshipBookings } from '@/lib/firestore/mentorshipBookings';
import MentorshipCard from './MentorshipCard';
import { MentorshipBooking } from '@/lib/types/Mentorship';
import Link from 'next/link';

export default function MentorshipPanel() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<MentorshipBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'client' | 'creator'>('client');
  
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, viewType]);
  
  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userBookings = await getUserMentorshipBookings(user.uid, viewType);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching mentorship bookings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mentorship Sessions</h2>
          <div className="animate-pulse w-24 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mentorship Sessions</h2>
        
        <div className="flex items-center mt-4 sm:mt-0">
          <div className="flex mr-4">
            <button
              className={`px-4 py-2 rounded-l-md ${
                viewType === 'client' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewType('client')}
            >
              My Bookings
            </button>
            <button
              className={`px-4 py-2 rounded-r-md ${
                viewType === 'creator' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewType('creator')}
            >
              Creator View
            </button>
          </div>
          
          {viewType === 'creator' && (
            <Link href="/mentorships/create">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Create New
              </button>
            </Link>
          )}
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {viewType === 'client' 
              ? 'You haven\'t booked any mentorship sessions' 
              : 'No one has booked your mentorship services yet'
            }
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {viewType === 'client'
              ? 'Find a mentor to help you level up your skills!'
              : viewType === 'creator' 
                ? 'Create a mentorship offer to share your expertise'
                : ''
            }
          </p>
          <Link href={viewType === 'client' ? '/mentorships' : '/mentorships/create'}>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
              {viewType === 'client' ? 'Browse Mentorships' : 'Create Mentorship'}
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <MentorshipCard
              key={booking.id}
              booking={booking}
              viewType={viewType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
