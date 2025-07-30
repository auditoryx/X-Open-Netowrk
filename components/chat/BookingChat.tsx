'use client';

import React, { useEffect, useRef, useState } from 'react';
import { sendMessage, subscribeToMessages, markMessagesAsSeen } from '../../lib/firestore/messages';
import { useAuth } from '@/lib/hooks/useAuth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';
import ChatThread from './ChatThread';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
  seen: boolean;
  seenBy?: string[];
  mediaUrl?: string;
};

const BookingChat: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToMessages(bookingId, async (msgs: Message[]) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [bookingId]);

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!user?.uid || !user?.displayName) return;

    setIsUploading(true);
    
    try {
      let mediaUrl = null;
      if (attachment) {
        const fileRef = ref(storage, `chats/${bookingId}/${Date.now()}_${attachment.name}`);
        await uploadBytes(fileRef, attachment);
        mediaUrl = await getDownloadURL(fileRef);
      }

      await sendMessage(bookingId, user.uid, user.displayName, newMessage, mediaUrl);
      setNewMessage('');
      setAttachment(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Add toast notification for error
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setAttachment(file);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-96 bg-white rounded-lg shadow-sm border">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-900">Booking Chat</h3>
        <p className="text-xs text-gray-500">Stay connected throughout your booking</p>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 min-h-0">
        <ChatThread
          messages={messages}
          currentUserId={user?.uid || ''}
          bookingId={bookingId}
          className="h-full"
        />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        {/* File preview */}
        {attachment && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <PaperClipIcon className="w-4 h-4" />
              <span className="truncate max-w-32">{attachment.name}</span>
              <span className="text-xs text-blue-500">
                ({(attachment.size / 1024 / 1024).toFixed(1)}MB)
              </span>
            </div>
            <button
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isUploading}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            {/* File attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Attach file"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            
            {/* Send button */}
            <button
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleSend}
              disabled={isUploading || (!newMessage.trim() && !attachment)}
              title="Send message"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
        
        {/* Helper text */}
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send • Shift+Enter for new line • Max 10MB
        </div>
      </div>
    </div>
  );
};

export default BookingChat;
