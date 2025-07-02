import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { EventBooking, getUserRoleInEvent } from '@/lib/types/EventBooking';
import { getEventBookingById } from '@/lib/firestore/getEventTeamBookings';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EventDetailsPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const { user } = useAuth();
  const [event, setEvent] = useState<EventBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (eventId && typeof eventId === 'string') {
      loadEvent(eventId);
    }
  }, [eventId]);

  const loadEvent = async (id: string) => {
    try {
      const eventData = await getEventBookingById(id);
      setEvent(eventData);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const userRole = user ? getUserRoleInEvent(event, user.uid) : 'Unknown';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-gray-600">Your role: {userRole}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-2">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Date:</span> {new Date(event.eventDate.toMillis()).toLocaleString()}</p>
                  {event.location && <p><span className="text-gray-500">Location:</span> {event.location}</p>}
                  <p><span className="text-gray-500">Team Size:</span> {event.rolesNeeded.length} roles</p>
                  {event.totalBudget && <p><span className="text-gray-500">Budget:</span> ${event.totalBudget.toLocaleString()}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Required Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {event.rolesNeeded.map(role => (
                    <span key={role} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{event.description}</p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-semibold mb-4">Team Members</h3>
              {event.selectedCreators && Object.keys(event.selectedCreators).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(event.selectedCreators).map(([role, creatorUid]) => (
                    <div key={role} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium capitalize">{role}</p>
                          <p className="text-sm text-gray-500">Creator ID: {creatorUid}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Assigned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific creators assigned yet. The system will recommend suitable creators.</p>
              )}
            </div>

            {event.bookingIds && event.bookingIds.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Individual Bookings</h3>
                <div className="space-y-2">
                  {event.bookingIds.map((bookingId, index) => (
                    <div key={bookingId} className="flex justify-between items-center p-3 border rounded">
                      <span>Booking {index + 1}: {bookingId}</span>
                      <Link 
                        href={`/bookings/${bookingId}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Link 
                href="/dashboard"
                className="text-blue-500 hover:underline"
              >
                ← Back to Dashboard
              </Link>
              
              {userRole === 'Client' && event.status === 'planning' && (
                <button 
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isConfirming}
                  onClick={async () => {
                    if (!user) return;
                    
                    setIsConfirming(true);
                    try {
                      // Get the user's ID token
                      const idToken = await user.getIdToken();
                      
                      const response = await fetch('/api/events/confirm', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${idToken}`
                        },
                        body: JSON.stringify({ eventId: event.id })
                      });
                      
                      if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.message || 'Failed to confirm event');
                      }
                      
                      toast.success('Event confirmed successfully');
                      
                      // Reload the event data
                      loadEvent(event.id as string);
                    } catch (error) {
                      console.error('Error confirming event:', error);
                      toast.error(error.message || 'Failed to confirm event');
                    } finally {
                      setIsConfirming(false);
                    }
                  }}
                >
                  {isConfirming ? 'Confirming...' : 'Confirm Event'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
