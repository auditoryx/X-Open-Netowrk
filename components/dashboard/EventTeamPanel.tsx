import { useState, useEffect } from 'react';
import { EventBooking, getUserRoleInEvent } from '@/lib/types/EventBooking';
import { getEventTeamBookings } from '@/lib/firestore/getEventTeamBookings';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EventTeamPanel() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      const eventBookings = await getEventTeamBookings(user.uid);
      setEvents(eventBookings);
    } catch (error) {
      console.error('Failed to load event bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Event Team Bookings</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Event Team Bookings</h2>
        <Link 
          href="/events/create" 
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No event bookings yet</div>
          <Link 
            href="/events/create"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} userRole={getUserRoleInEvent(event, user?.uid || '')} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, userRole }: { event: EventBooking; userRole: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { user } = useAuth();
  const isClient = userRole === 'Client';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const confirmEvent = async () => {
    if (!user || !event.id) return;
    
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
      
      // Reload the page to refresh event data
      window.location.reload();
    } catch (error) {
      console.error('Error confirming event:', error);
      toast.error(error.message || 'Failed to confirm event');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-sm text-gray-600">Your role: {userRole}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
          {event.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Event Date</p>
          <p className="font-medium">{new Date(event.eventDate.toMillis()).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Team Size</p>
          <p className="font-medium">{event.rolesNeeded.length} roles</p>
        </div>
      </div>

      {event.location && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">{event.location}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Required Roles</p>
        <div className="flex flex-wrap gap-2">
          {event.rolesNeeded.map(role => (
            <span key={role} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
              {role}
            </span>
          ))}
        </div>
      </div>

      {event.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-sm">{event.description}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Created {new Date(event.createdAt.toMillis()).toLocaleDateString()}
        </div>
        
        <div className="flex space-x-2">
          {isClient && event.status === 'planning' && (
            <button
              onClick={confirmEvent}
              disabled={isConfirming}
              className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isConfirming ? 'Confirming...' : 'Confirm Event'}
            </button>
          )}
          <Link 
            href={`/events/${event.id}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
