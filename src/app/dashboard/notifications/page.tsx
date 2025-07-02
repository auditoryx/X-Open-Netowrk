'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getNotifications } from '@/lib/firestore/getNotifications';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/firestore/markNotificationRead';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  Calendar,
  MessageCircle,
  User,
  AlertCircle,
  ExternalLink,
  Check,
  CheckCheck,
  Filter,
  Search
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: any;
  data?: {
    bookingId?: string;
    messageThreadId?: string;
    userId?: string;
    url?: string;
  };
}

type NotificationFilter = 'all' | 'unread' | 'booking' | 'message' | 'system';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const notificationsData = await getNotifications(user.uid, 50); // Get more for full page
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.uid]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'booking':
        return notification.type === 'booking';
      case 'message':
        return notification.type === 'message';
      case 'system':
        return notification.type === 'system';
      default:
        return true;
    }
  });

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      await markNotificationRead(user.uid, notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsRead(user.uid);
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data) {
      if (notification.data.url) {
        window.location.href = notification.data.url;
      } else if (notification.data.bookingId) {
        window.location.href = `/dashboard/bookings/${notification.data.bookingId}`;
      } else if (notification.data.messageThreadId) {
        window.location.href = `/dashboard/messages/${notification.data.messageThreadId}`;
      } else if (notification.data.userId) {
        window.location.href = `/profile/${notification.data.userId}`;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
          <p className="text-gray-600">Stay updated with your latest activity</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as NotificationFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="booking">Bookings</option>
              <option value="message">Messages</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You\'ll see your notifications here when you receive them'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.isRead ? 'ring-2 ring-blue-100 border-blue-200' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">{notification.type}</span>
                          <span>
                            {formatDistanceToNow(
                              notification.createdAt?.toDate ? 
                                notification.createdAt.toDate() : 
                                new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {notification.data?.url && (
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button (if needed) */}
        {filteredNotifications.length >= 50 && (
          <div className="text-center mt-6">
            <button
              onClick={fetchNotifications}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Load more notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
