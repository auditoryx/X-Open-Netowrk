'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { messageService, Message, MessageThread } from '@/lib/services/messageService';
import { ArrowLeft, Send, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const threadId = params?.threadId as string;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?.uid || !threadId) return;

    const loadThread = async () => {
      try {
        const threadDoc = await getDoc(doc(db, 'messageThreads', threadId));
        if (threadDoc.exists()) {
          setThread({ id: threadDoc.id, ...threadDoc.data() } as MessageThread);
        }
      } catch (error) {
        console.error('Failed to load thread:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThread();

    // Listen to messages
    const unsubscribe = messageService.listenToMessages(threadId, (newMessages) => {
      setMessages(newMessages);
    });

    // Mark messages as read when component mounts
    messageService.markMessagesAsRead(threadId, user.uid);

    return unsubscribe;
  }, [user, threadId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !thread || sending) return;

    const otherParticipantId = thread.participants.find(p => p !== user.uid);
    if (!otherParticipantId) return;

    setSending(true);

    try {
      await messageService.sendMessage(
        threadId,
        user.uid,
        otherParticipantId,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!thread || !user?.uid) return null;
    const otherParticipantId = thread.participants.find(p => p !== user.uid);
    return {
      id: otherParticipantId,
      name: otherParticipantId ? thread.participantNames[otherParticipantId] : 'Unknown User'
    };
  };

  const formatMessageTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Conversation not found</p>
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-screen bg-neutral-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {otherParticipant?.name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 className="font-medium">{otherParticipant?.name}</h2>
            <p className="text-xs text-gray-400">
              Last seen {formatDistanceToNow(thread.lastMessageAt.toDate(), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === user?.uid;
            const showTimestamp = index === 0 || 
              (messages[index - 1] && 
               Math.abs(message.createdAt.toDate().getTime() - messages[index - 1].createdAt.toDate().getTime()) > 5 * 60 * 1000); // 5 minutes

            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {showTimestamp && (
                    <div className="text-xs text-gray-400 text-center mb-2">
                      {formatMessageTime(message.createdAt)}
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-brand-500 text-white ml-auto'
                        : 'bg-neutral-700 text-white mr-auto'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    
                    {message.mediaUrl && (
                      <div className="mt-2">
                        {message.mediaUrl.includes('image') ? (
                          <Image 
                            src={message.mediaUrl} 
                            alt="Shared media" 
                            width={300}
                            height={200}
                            className="max-w-full rounded"
                          />
                        ) : (
                          <a 
                            href={message.mediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-200 hover:text-brand-100 underline"
                          >
                            📎 View attachment
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-brand-100' : 'text-gray-400'}`}>
                      {message.isRead ? '✓✓' : '✓'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-neutral-800 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-700 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-brand-500"
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
