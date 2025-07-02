'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChatMessages } from '@lib/chat/useChatMessages';
import { sendMessage } from '@lib/chat/sendMessage';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
  bookingId: string;
}

interface Booking {
  id: string;
  clientUid: string;
  providerUid: string;
  clientName?: string;
  providerName?: string;
  serviceName?: string;
  status: string;
}

interface BookingChatThreadProps {
  bookingId: string;
  booking: Booking;
}

const BookingChatThread: React.FC<BookingChatThreadProps> = ({ bookingId, booking }) => {
  const { user } = useAuth();
  const { messages, loading, error } = useChatMessages(bookingId);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    setIsTyping(false);

    try {
      await sendMessage({
        bookingId,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        content: newMessage.trim(),
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Simple typing indicator logic
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '';
    try {
      return format(timestamp.toDate(), 'MMM d, h:mm a');
    } catch (error) {
      return '';
    }
  };

  const getMessageSenderName = (message: Message): string => {
    if (message.senderId === user?.uid) {
      return 'You';
    }
    return message.senderName || 'User';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          Booking Chat
        </h3>
        <p className="text-sm text-gray-600">
          Communicate with {user?.uid === booking.clientUid ? booking.providerName || 'your provider' : booking.clientName || 'your client'}
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.uid
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {getMessageSenderName(message)}
                  </span>
                  <span className={`text-xs ${
                    message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg max-w-xs">
              <p className="text-sm italic">You are typing...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSending}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {/* Character Counter */}
        <div className="mt-2 text-xs text-gray-500 text-right">
          {newMessage.length}/500 characters
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            Error loading messages: {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingChatThread;
