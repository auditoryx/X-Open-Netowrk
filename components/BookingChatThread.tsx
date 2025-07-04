'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { useChatMessages } from '@/lib/chat/useChatMessages';
import { sendMessage } from '@/lib/chat/sendMessage';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  sentAt: any;
  seen?: boolean;
}

interface BookingChatThreadProps {
  bookingId: string;
  booking: {
    clientUid: string;
    providerUid: string;
    clientName?: string;
    providerName?: string;
  };
}

const BookingChatThread: React.FC<BookingChatThreadProps> = ({ bookingId, booking }) => {
  const { user } = useAuth();
  const { messages, loading } = useChatMessages(bookingId);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);

    try {
      await sendMessage({
        bookingId,
        senderUid: user.uid,
        senderName: user.displayName || user.email || 'User',
        text: messageText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const isMyMessage = (message: Message) => message.senderUid === user?.uid;

  const getSenderName = (message: Message) => {
    if (message.senderUid === booking.clientUid) {
      return booking.clientName || 'Client';
    }
    if (message.senderUid === booking.providerUid) {
      return booking.providerName || 'Provider';
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
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMyMessage(message)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Sender name (only for others) */}
                {!isMyMessage(message) && (
                  <p className="text-xs font-medium text-gray-600 mb-1\">
                    {getSenderName(message)}
                  </p>
                )}
                
                {/* Message text */}
                <p className="text-sm whitespace-pre-wrap\">{message.text}</p>
                
                {/* Timestamp */}
                <p
                  className={`text-xs mt-1 ${
                    isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.sentAt ? format(message.sentAt.toDate(), 'HH:mm') : 'Sending...'}
                  {isMyMessage(message) && message.seen && (
                    <span className="ml-1\">✓✓</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100\">
          You are typing...
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!user}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !user}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingChatThread;
