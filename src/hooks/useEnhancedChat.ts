'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { RealtimeService, TypingIndicator, PresenceData, MessageReadReceipt } from '@/lib/firebase/realtimeService';

interface UseEnhancedChatProps {
  chatId: string;
  participantIds: string[];
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function useEnhancedChat({ 
  chatId, 
  participantIds, 
  onTypingStart, 
  onTypingStop 
}: UseEnhancedChatProps) {
  const { data: session } = useSession();
  const [realtimeService] = useState(() => new RealtimeService());
  
  // State
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [presenceData, setPresenceData] = useState<PresenceData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [readReceipts, setReadReceipts] = useState<Map<string, MessageReadReceipt[]>>(new Map());
  
  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const unsubscribersRef = useRef<(() => void)[]>([]);

  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name;
  const currentUserAvatar = session?.user?.image;

  // Setup subscriptions
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    // Subscribe to typing indicators
    const unsubscribeTyping = realtimeService.subscribeToTyping(chatId, (users) => {
      const otherUsers = users.filter(u => u.userId !== currentUserId && u.isTyping);
      setTypingUsers(otherUsers);
    });

    // Subscribe to presence data
    const unsubscribePresence = realtimeService.subscribeToPresence(participantIds, (data) => {
      setPresenceData(data);
    });

    // Subscribe to connection status
    const unsubscribeConnection = realtimeService.subscribeToConnectionStatus((connected) => {
      setIsConnected(connected);
    });

    // Subscribe to chat activity
    const unsubscribeActivity = realtimeService.subscribeToChatActivity(chatId, (activity) => {
      // Handle chat activity updates if needed
    });

    // Store unsubscribers
    unsubscribersRef.current = [
      unsubscribeTyping,
      unsubscribePresence,
      unsubscribeConnection,
      unsubscribeActivity
    ];

    // Set initial presence
    realtimeService.updatePresence(currentUserId, true, currentUserName, currentUserAvatar);

    // Cleanup function
    return () => {
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribersRef.current = [];
    };
  }, [chatId, currentUserId, participantIds, realtimeService, currentUserName, currentUserAvatar]);

  // Handle typing indicators
  const startTyping = useCallback(() => {
    if (!currentUserId || !chatId) return;

    if (!isTyping) {
      setIsTyping(true);
      realtimeService.updateTypingStatus(
        chatId, 
        currentUserId, 
        true, 
        currentUserName, 
        currentUserAvatar
      );
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [chatId, currentUserId, isTyping, realtimeService, currentUserName, currentUserAvatar, onTypingStart]);

  const stopTyping = useCallback(() => {
    if (!currentUserId || !chatId) return;

    if (isTyping) {
      setIsTyping(false);
      realtimeService.updateTypingStatus(chatId, currentUserId, false);
      onTypingStop?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [chatId, currentUserId, isTyping, realtimeService, onTypingStop]);

  // Handle message input
  const handleMessageInput = useCallback((value: string) => {
    if (value.trim().length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [startTyping, stopTyping]);

  // Handle message send
  const handleMessageSend = useCallback(() => {
    stopTyping();
    
    if (currentUserId && chatId) {
      // Update chat activity
      realtimeService.updateChatActivity(chatId, currentUserId);
      lastActivityRef.current = Date.now();
    }
  }, [stopTyping, currentUserId, chatId, realtimeService]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId: string) => {
    if (!currentUserId || !chatId) return;

    realtimeService.markMessageAsRead(chatId, messageId, currentUserId);
  }, [chatId, currentUserId, realtimeService]);

  // Mark multiple messages as read
  const markMultipleMessagesAsRead = useCallback((messageIds: string[]) => {
    if (!currentUserId || !chatId) return;

    realtimeService.markMultipleMessagesAsRead(chatId, messageIds, currentUserId);
  }, [chatId, currentUserId, realtimeService]);

  // Subscribe to read receipts for a message
  const subscribeToMessageReadReceipts = useCallback((messageId: string) => {
    if (!chatId) return () => {};

    return realtimeService.subscribeToReadReceipts(chatId, messageId, (receipts) => {
      setReadReceipts(prev => new Map(prev).set(messageId, receipts));
    });
  }, [chatId, realtimeService]);

  // Update presence when component mounts/unmounts
  useEffect(() => {
    if (!currentUserId) return;

    // Set online when component mounts
    realtimeService.updatePresence(currentUserId, true, currentUserName, currentUserAvatar);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        realtimeService.updatePresence(currentUserId, false, currentUserName, currentUserAvatar);
      } else {
        realtimeService.updatePresence(currentUserId, true, currentUserName, currentUserAvatar);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload
    const handleBeforeUnload = () => {
      realtimeService.updatePresence(currentUserId, false, currentUserName, currentUserAvatar);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set offline when component unmounts
      realtimeService.updatePresence(currentUserId, false, currentUserName, currentUserAvatar);
    };
  }, [currentUserId, realtimeService, currentUserName, currentUserAvatar]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Helper functions
  const getOnlineUsers = useCallback(() => {
    return presenceData.filter(p => p.isOnline);
  }, [presenceData]);

  const getUserPresence = useCallback((userId: string) => {
    return presenceData.find(p => p.userId === userId);
  }, [presenceData]);

  const getMessageReadReceipts = useCallback((messageId: string) => {
    return readReceipts.get(messageId) || [];
  }, [readReceipts]);

  const getUnreadMessageCount = useCallback((messageIds: string[]) => {
    if (!currentUserId) return 0;
    
    return messageIds.filter(messageId => {
      const receipts = readReceipts.get(messageId) || [];
      return !receipts.some(receipt => receipt.readBy === currentUserId);
    }).length;
  }, [currentUserId, readReceipts]);

  // Message reactions
  const addMessageReaction = useCallback((messageId: string, reaction: string) => {
    if (!currentUserId || !chatId) return;

    realtimeService.addMessageReaction(chatId, messageId, currentUserId, reaction);
  }, [chatId, currentUserId, realtimeService]);

  const removeMessageReaction = useCallback((messageId: string) => {
    if (!currentUserId || !chatId) return;

    realtimeService.removeMessageReaction(chatId, messageId, currentUserId);
  }, [chatId, currentUserId, realtimeService]);

  const subscribeToMessageReactions = useCallback((messageId: string) => {
    if (!chatId) return () => {};

    return realtimeService.subscribeToMessageReactions(chatId, messageId, (reactions) => {
      // Handle reactions update
    });
  }, [chatId, realtimeService]);

  return {
    // State
    isTyping,
    typingUsers,
    presenceData,
    isConnected,
    readReceipts,
    
    // Actions
    startTyping,
    stopTyping,
    handleMessageInput,
    handleMessageSend,
    markMessageAsRead,
    markMultipleMessagesAsRead,
    addMessageReaction,
    removeMessageReaction,
    
    // Subscriptions
    subscribeToMessageReadReceipts,
    subscribeToMessageReactions,
    
    // Helpers
    getOnlineUsers,
    getUserPresence,
    getMessageReadReceipts,
    getUnreadMessageCount,
    
    // Service
    realtimeService
  };
}