'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { messageService, MessageThread } from '@/lib/services/messageService';
import { MessageSquare, Search, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const loadThreads = async () => {
      try {
        const userThreads = await messageService.getUserThreads(user.uid);
        setThreads(userThreads);
      } catch (error) {
        console.error('Failed to load message threads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();

    // Set up real-time listener for threads
    const unsubscribe = messageService.listenToUserThreads(user.uid, (updatedThreads) => {
      setThreads(updatedThreads);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredThreads = threads.filter(thread => {
    const otherParticipant = thread.participants.find(p => p !== user?.uid);
    const otherParticipantName = otherParticipant ? thread.participantNames[otherParticipant] : '';
    return otherParticipantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipant = (thread: MessageThread) => {
    const otherParticipantId = thread.participants.find(p => p !== user?.uid);
    return {
      id: otherParticipantId,
      name: otherParticipantId ? thread.participantNames[otherParticipantId] : 'Unknown User'
    };
  };

  const getUnreadCount = (thread: MessageThread) => {
    return user?.uid ? thread.unreadCount[user.uid] || 0 : 0;
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-neutral-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-4 bg-neutral-700 rounded"></div>
                  <div className="w-2/3 h-3 bg-neutral-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MessageSquare className="w-4 h-4" />
          <span>{threads.length} conversation{threads.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-12">
            {threads.length === 0 ? (
              <>
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No messages yet</h3>
                <p className="text-gray-400 mb-6">Start a conversation with a creator to see messages here.</p>
                <Link
                  href="/explore"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Explore Creators
                </Link>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No conversations match your search.</p>
              </>
            )}
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const otherParticipant = getOtherParticipant(thread);
            const unreadCount = getUnreadCount(thread);
            
            return (
              <Link
                key={thread.id}
                href={`/dashboard/messages/${thread.id}`}
                className="block bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 transition-colors border border-white/10 hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {otherParticipant.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-white truncate">
                        {otherParticipant.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(thread.lastMessageAt.toDate(), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {thread.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
