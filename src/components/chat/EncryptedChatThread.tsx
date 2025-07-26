/**
 * Enhanced Encrypted Chat Component
 * 
 * Replaces the existing BookingChatThread with E2E encryption support
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { format } from 'date-fns';
import { Shield, ShieldCheck, AlertTriangle, Key, RefreshCw } from 'lucide-react';
import { decryptChatMessage, isEncryptionSupported } from '@/lib/encryption/e2e-chat';
import { initializeChatEncryption, getChatEncryptionContext } from '@/lib/encryption/key-exchange';

interface EncryptedMessage {
  id: string;
  senderId: string;
  senderName: string;
  encryptedContent: string;
  isEncrypted: boolean;
  timestamp: any;
  bookingId: string;
  recipientId: string;
  messageType: 'text' | 'system';
  sessionId?: string;
  seen: boolean;
}

interface DecryptedMessageDisplay {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
  isEncrypted: boolean;
  decryptionStatus: 'success' | 'failed' | 'pending';
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

interface EncryptedChatThreadProps {
  bookingId: string;
  booking: Booking;
}

const EncryptedChatThread: React.FC<EncryptedChatThreadProps> = ({ bookingId, booking }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessageDisplay[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<'initializing' | 'enabled' | 'disabled' | 'error'>('initializing');
  const [encryptionSupported, setEncryptionSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check encryption support on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = isEncryptionSupported();
      setEncryptionSupported(supported);
      if (!supported) {
        setEncryptionStatus('disabled');
        setError('Your browser does not support end-to-end encryption');
      }
    };
    
    checkSupport();
  }, []);

  // Initialize encryption for current user
  useEffect(() => {
    const initializeEncryption = async () => {
      if (!user?.uid || !encryptionSupported) return;

      try {
        setEncryptionStatus('initializing');
        const success = await initializeChatEncryption(user.uid);
        
        if (success) {
          setEncryptionStatus('enabled');
        } else {
          setEncryptionStatus('error');
          setError('Failed to initialize encryption keys');
        }
      } catch (error) {
        console.error('Encryption initialization failed:', error);
        setEncryptionStatus('error');
        setError('Encryption initialization failed');
      }
    };

    initializeEncryption();
  }, [user?.uid, encryptionSupported]);

  // Load and decrypt messages
  const loadMessages = useCallback(async () => {
    if (!user?.uid || encryptionStatus !== 'enabled') return;

    try {
      setLoading(true);
      const response = await fetch(`/api/chat/encrypted?bookingId=${bookingId}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      const encryptedMessages: EncryptedMessage[] = data.messages;

      // Decrypt messages
      const decryptedMessages: DecryptedMessageDisplay[] = [];
      
      for (const msg of encryptedMessages) {
        if (msg.isEncrypted) {
          try {
            // Get recipient's private key for decryption
            const recipientId = msg.recipientId === user.uid ? user.uid : msg.senderId;
            const privateKey = localStorage.getItem(`chatPrivateKey_${recipientId}`);
            
            if (privateKey) {
              const decryptedContent = await decryptChatMessage(msg.encryptedContent, privateKey);
              
              decryptedMessages.push({
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                content: decryptedContent,
                timestamp: msg.timestamp,
                isEncrypted: true,
                decryptionStatus: 'success',
              });
            } else {
              decryptedMessages.push({
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                content: '[Encrypted message - decryption key unavailable]',
                timestamp: msg.timestamp,
                isEncrypted: true,
                decryptionStatus: 'failed',
              });
            }
          } catch (decryptError) {
            console.error('Decryption failed for message:', msg.id, decryptError);
            decryptedMessages.push({
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.senderName,
              content: '[Encrypted message - decryption failed]',
              timestamp: msg.timestamp,
              isEncrypted: true,
              decryptionStatus: 'failed',
            });
          }
        } else {
          // Unencrypted message
          decryptedMessages.push({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.encryptedContent,
            timestamp: msg.timestamp,
            isEncrypted: false,
            decryptionStatus: 'success',
          });
        }
      }

      setMessages(decryptedMessages.reverse()); // Show newest at bottom
      setError(null);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [bookingId, user?.uid, encryptionStatus]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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
      const recipientId = user.uid === booking.clientUid ? booking.providerUid : booking.clientUid;
      
      const response = await fetch('/api/chat/encrypted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          recipientId,
          message: newMessage.trim(),
          isEncrypted: encryptionStatus === 'enabled',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setNewMessage('');
      
      // Reload messages to show the new one
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const getMessageSenderName = (message: DecryptedMessageDisplay): string => {
    if (message.senderId === user?.uid) {
      return 'You';
    }
    return message.senderName || 'User';
  };

  const renderEncryptionStatus = () => {
    const getStatusIcon = () => {
      switch (encryptionStatus) {
        case 'enabled':
          return <ShieldCheck className="w-4 h-4 text-green-600" />;
        case 'disabled':
          return <Shield className="w-4 h-4 text-gray-400" />;
        case 'error':
          return <AlertTriangle className="w-4 h-4 text-red-600" />;
        case 'initializing':
          return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
        default:
          return <Shield className="w-4 h-4 text-gray-400" />;
      }
    };

    const getStatusText = () => {
      switch (encryptionStatus) {
        case 'enabled':
          return 'End-to-end encrypted';
        case 'disabled':
          return 'Encryption disabled';
        case 'error':
          return 'Encryption error';
        case 'initializing':
          return 'Initializing encryption...';
        default:
          return 'Unknown status';
      }
    };

    return (
      <div className="flex items-center space-x-2 text-xs">
        {getStatusIcon()}
        <span className={`${
          encryptionStatus === 'enabled' ? 'text-green-600' : 
          encryptionStatus === 'error' ? 'text-red-600' : 
          'text-gray-500'
        }`}>
          {getStatusText()}
        </span>
      </div>
    );
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
      {/* Header with encryption status */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Secure Chat
            </h3>
            <p className="text-sm text-gray-600">
              With {user?.uid === booking.clientUid ? booking.providerName || 'your provider' : booking.clientName || 'your client'}
            </p>
          </div>
          {renderEncryptionStatus()}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Key className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No messages yet. Start the secure conversation!</p>
            <p className="text-xs mt-1">Messages are end-to-end encrypted</p>
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
                  <div className="flex items-center space-x-1">
                    {message.isEncrypted && (
                      <Shield className={`w-3 h-3 ${
                        message.decryptionStatus === 'success' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`} />
                    )}
                    <span className={`text-xs ${
                      message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm ${
                  message.decryptionStatus === 'failed' ? 'italic text-gray-400' : ''
                }`}>
                  {message.content}
                </p>
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
            placeholder={encryptionStatus === 'enabled' ? 'Type your secure message...' : 'Type your message...'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSending || encryptionStatus === 'error'}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || encryptionStatus === 'error'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            {encryptionStatus === 'enabled' && <Shield className="w-4 h-4" />}
            <span>{isSending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
        
        {/* Character Counter and Status */}
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <div>
            {newMessage.length}/2000 characters
          </div>
          <div className="flex items-center space-x-2">
            {encryptionStatus === 'enabled' && (
              <span className="text-green-600">🔒 Encrypted</span>
            )}
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            Error: {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default EncryptedChatThread;