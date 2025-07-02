import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserBookings } from '@/lib/firestore/getUserBookings';
import { getUserMessages, MessageThread } from '@/lib/firestore/getUserMessages';
import { formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  MessageCircle, 
  Clock, 
  User, 
  ChevronRight,
  Filter,
  Search 
} from 'lucide-react';

interface Booking {
  id: string;
  clientUid: string;
  providerUid: string;
  serviceName: string;
  status: string;
  scheduledDate: any;
  createdAt: any;
  updatedAt: any;
  clientName?: string;
  providerName?: string;
  lastMessageAt?: any;
}

type InboxFilter = 'all' | 'active' | 'pending' | 'completed';

const BookingInbox: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const fetchInboxData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings and messages in parallel
        const [bookingsData, messagesData] = await Promise.all([
          getUserBookings(user.uid),
          getUserMessages(user.uid, 20)
        ]);

        setBookings(bookingsData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching inbox data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInboxData();
  }, [user?.uid]);

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.providerName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case 'active':
        return booking.status === 'confirmed' || booking.status === 'in-progress';
      case 'pending':
        return booking.status === 'pending';
      case 'completed':
        return booking.status === 'completed' || booking.status === 'cancelled';
      default:
        return true;
    }
  });

  // Combine and sort bookings with messages by activity
  const sortedItems = [
    ...filteredBookings.map(booking => ({
      type: 'booking' as const,
      data: booking,
      timestamp: booking.lastMessageAt || booking.updatedAt || booking.createdAt
    })),
    ...messages.map(message => ({
      type: 'message' as const,
      data: message,
      timestamp: message.lastMessage.timestamp
    }))
  ].sort((a, b) => {
    const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return timeB.getTime() - timeA.getTime();
  });

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookingClick = (bookingId: string) => {
    window.location.href = `/dashboard/bookings/${bookingId}`;
  };

  const handleMessageClick = (threadId: string) => {
    window.location.href = `/dashboard/messages/${threadId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Inbox</h1>
        <p className="text-gray-600">Manage your bookings and messages in one place</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search bookings, services, or names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as InboxFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Bookings</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Inbox Items */}
      <div className="space-y-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500">Your bookings and messages will appear here</p>
          </div>
        ) : (
          sortedItems.map((item, index) => (
            <div
              key={`${item.type}-${item.data.id}-${index}`}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (item.type === 'booking') {
                  handleBookingClick(item.data.id);
                } else {
                  handleMessageClick(item.data.id);
                }
              }}
            >
              {item.type === 'booking' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {item.data.serviceName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(item.data.status)}`}>
                          {item.data.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {user?.uid === item.data.clientUid ? item.data.providerName : item.data.clientName}
                        </span>
                        {item.data.scheduledDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.data.scheduledDate.toDate()).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Updated {formatDistanceToNow(
                          item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          Message Thread
                        </h3>
                        {item.data.unreadCount && item.data.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {item.data.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {item.data.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(
                          item.data.lastMessage.timestamp.toDate(),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingInbox;
