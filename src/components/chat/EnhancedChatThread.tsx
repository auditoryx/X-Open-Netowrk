'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import TypingIndicator from './TypingIndicator';
import PresenceIndicator, { PresenceAvatar } from './PresenceIndicator';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  senderName?: string;
  senderAvatar?: string;
}

interface EnhancedChatThreadProps {
  chatId: string;
  participantIds: string[];
  messages: Message[];
  onSendMessage: (content: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function EnhancedChatThread({
  chatId,
  participantIds,
  messages,
  onSendMessage,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = ''
}: EnhancedChatThreadProps) {
  const { data: session } = useSession();
  const [messageInput, setMessageInput] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id;

  const {
    isTyping,
    typingUsers,
    presenceData,
    isConnected,
    handleMessageInput,
    handleMessageSend,
    markMessageAsRead,
    markMultipleMessagesAsRead,
    getOnlineUsers,
    getUserPresence,
    getMessageReadReceipts,
    subscribeToMessageReadReceipts,
    addMessageReaction,
    removeMessageReaction
  } = useEnhancedChat({
    chatId,
    participantIds,
    onTypingStart: () => console.log('Started typing'),
    onTypingStop: () => console.log('Stopped typing')
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Mark messages as read when they come into view
  useEffect(() => {
    if (currentUserId && messages.length > 0) {
      const unreadMessages = messages
        .filter(msg => msg.senderId !== currentUserId)
        .map(msg => msg.id);

      if (unreadMessages.length > 0) {
        markMultipleMessagesAsRead(unreadMessages);
      }
    }
  }, [messages, currentUserId, markMultipleMessagesAsRead]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100;
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    
    setIsAtBottom(atBottom);

    // Load more messages if scrolled to top
    if (scrollTop === 0 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && currentUserId) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
      handleMessageSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);
    handleMessageInput(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === currentUserId;
    const senderPresence = getUserPresence(message.senderId);

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isOwnMessage && (
          <PresenceAvatar
            userId={message.senderId}
            avatarUrl={message.senderAvatar}
            userName={message.senderName}
            size="sm"
            className="mr-2 flex-shrink-0"
          />
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {message.senderName || 'Unknown'}
              </span>
              <PresenceIndicator userId={message.senderId} size="sm" />
            </div>
          )}
          
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwnMessage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          
          <div className={`flex items-center gap-2 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.timestamp)}
            </span>
            
            {isOwnMessage && (
              <MessageReadStatus 
                messageId={message.id}
                participantIds={participantIds.filter(id => id !== currentUserId)}
                subscribeToReadReceipts={subscribeToMessageReadReceipts}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const onlineUsers = getOnlineUsers();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with online status */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Chat</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {onlineUsers.length} online
          </span>
          <div className="flex -space-x-1">
            {onlineUsers.slice(0, 3).map(user => (
              <PresenceAvatar
                key={user.userId}
                userId={user.userId}
                avatarUrl={user.userAvatar}
                userName={user.userName}
                size="sm"
              />
            ))}
            {onlineUsers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{onlineUsers.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {messages.map(renderMessage)}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator
            chatId={chatId}
            currentUserId={currentUserId || ''}
            className="ml-12"
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Character count or typing indicator */}
            {isTyping && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                typing...
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!messageInput.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// Component for message read status
function MessageReadStatus({ 
  messageId, 
  participantIds, 
  subscribeToReadReceipts 
}: {
  messageId: string;
  participantIds: string[];
  subscribeToReadReceipts: (messageId: string) => () => void;
}) {
  const [readReceipts, setReadReceipts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToReadReceipts(messageId);
    return unsubscribe;
  }, [messageId, subscribeToReadReceipts]);

  const readCount = readReceipts.length;
  const totalParticipants = participantIds.length;

  if (readCount === 0) {
    return <span className="text-xs text-gray-400">Sent</span>;
  }

  if (readCount === totalParticipants) {
    return <span className="text-xs text-blue-400">Read</span>;
  }

  return <span className="text-xs text-gray-400">Delivered</span>;
}