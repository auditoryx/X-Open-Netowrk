'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { messageService, MessageThread } from '@/lib/services/messageService';
import { useAuth } from '@/lib/hooks/useAuth';

interface MessagesPreviewProps {
  limit?: number;
}

export default function MessagesPreview({ limit = 5 }: MessagesPreviewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await messageService.getUserThreads(user.uid);
        const limitedMessages = messagesData.slice(0, limit);
        
        // Calculate total unread count
        const totalUnread = messagesData.reduce((total, thread) => {
          return total + (thread.unreadCount[user.uid] || 0);
        }, 0);
        
        setMessages(limitedMessages);
        setUnreadCount(totalUnread);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time listener
    const unsubscribe = messageService.listenToUserThreads(user.uid, (updatedThreads) => {
      const limitedMessages = updatedThreads.slice(0, limit);
      const totalUnread = updatedThreads.reduce((total, thread) => {
        return total + (thread.unreadCount[user.uid] || 0);
      }, 0);
      
      setMessages(limitedMessages);
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [user?.uid, limit]);

  const formatTimestamp = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return 'Recently';
    }
  };

  const getOtherParticipant = (thread: MessageThread) => {
    const otherParticipantId = thread.participants.find(p => p !== user?.uid);
    return otherParticipantId ? thread.participantNames[otherParticipantId] : 'Unknown User';
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Recent Messages</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Link 
          href="/dashboard/messages"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">💬</div>
          <p className="text-gray-400">No messages yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Messages will appear here when clients contact you
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((thread) => {
            const otherParticipant = getOtherParticipant(thread);
            const userUnreadCount = user?.uid ? thread.unreadCount[user.uid] || 0 : 0;
            const isUnread = userUnreadCount > 0;
            
            return (
              <Link
                key={thread.id}
                href={`/dashboard/messages/${thread.id}`}
                className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {otherParticipant.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium truncate ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                        {otherParticipant}
                      </h4>
                      <div className="flex items-center gap-2">
                        {isUnread && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {userUnreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimestamp(thread.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-300' : 'text-gray-400'}`}>
                      {truncateMessage(thread.lastMessage || 'No messages yet')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
