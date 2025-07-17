import { 
  ref, 
  push, 
  set, 
  remove, 
  onValue, 
  off, 
  onDisconnect, 
  serverTimestamp,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database';
import { database } from './realtime';

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: number;
  userName?: string;
  userAvatar?: string;
}

export interface PresenceData {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  userName?: string;
  userAvatar?: string;
}

export interface MessageReadReceipt {
  messageId: string;
  readBy: string;
  readAt: number;
}

export class RealtimeService {
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private presenceRef: DatabaseReference | null = null;

  // Typing indicators
  async updateTypingStatus(
    chatId: string,
    userId: string,
    isTyping: boolean,
    userName?: string,
    userAvatar?: string
  ): Promise<void> {
    const typingRef = ref(database, `typing/${chatId}/${userId}`);
    
    if (isTyping) {
      await set(typingRef, {
        isTyping: true,
        timestamp: serverTimestamp(),
        userName: userName || '',
        userAvatar: userAvatar || ''
      });
      
      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(`${chatId}:${userId}`);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Auto-remove after 3 seconds
      const timeout = setTimeout(() => {
        remove(typingRef);
        this.typingTimeouts.delete(`${chatId}:${userId}`);
      }, 3000);
      
      this.typingTimeouts.set(`${chatId}:${userId}`, timeout);
    } else {
      await remove(typingRef);
      
      // Clear timeout
      const existingTimeout = this.typingTimeouts.get(`${chatId}:${userId}`);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.typingTimeouts.delete(`${chatId}:${userId}`);
      }
    }
  }

  subscribeToTyping(
    chatId: string, 
    callback: (typingUsers: TypingIndicator[]) => void
  ): () => void {
    const typingRef = ref(database, `typing/${chatId}`);
    
    const listener = onValue(typingRef, (snapshot: DataSnapshot) => {
      const typingData = snapshot.val() || {};
      const typingUsers: TypingIndicator[] = Object.entries(typingData).map(([userId, data]: [string, any]) => ({
        userId,
        isTyping: data.isTyping,
        timestamp: data.timestamp,
        userName: data.userName,
        userAvatar: data.userAvatar
      }));
      
      callback(typingUsers);
    });

    return () => off(typingRef, 'value', listener);
  }

  // Presence system
  async updatePresence(
    userId: string,
    isOnline: boolean,
    userName?: string,
    userAvatar?: string
  ): Promise<void> {
    const presenceRef = ref(database, `presence/${userId}`);
    
    const presenceData: PresenceData = {
      userId,
      isOnline,
      lastSeen: Date.now(),
      userName: userName || '',
      userAvatar: userAvatar || ''
    };
    
    await set(presenceRef, presenceData);
    
    if (isOnline) {
      // Set offline when user disconnects
      onDisconnect(presenceRef).set({
        ...presenceData,
        isOnline: false,
        lastSeen: serverTimestamp()
      });
      
      this.presenceRef = presenceRef;
    }
  }

  subscribeToPresence(
    userIds: string[],
    callback: (presenceData: PresenceData[]) => void
  ): () => void {
    const unsubscribers: (() => void)[] = [];
    const presenceMap = new Map<string, PresenceData>();
    
    userIds.forEach(userId => {
      const presenceRef = ref(database, `presence/${userId}`);
      
      const listener = onValue(presenceRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
          presenceMap.set(userId, data);
        } else {
          presenceMap.delete(userId);
        }
        
        callback(Array.from(presenceMap.values()));
      });
      
      unsubscribers.push(() => off(presenceRef, 'value', listener));
    });
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  async getUserPresence(userId: string): Promise<PresenceData | null> {
    return new Promise((resolve) => {
      const presenceRef = ref(database, `presence/${userId}`);
      
      onValue(presenceRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        resolve(data || null);
      }, { onlyOnce: true });
    });
  }

  // Message read receipts
  async markMessageAsRead(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const receiptRef = ref(database, `read_receipts/${chatId}/${messageId}/${userId}`);
    
    await set(receiptRef, {
      messageId,
      readBy: userId,
      readAt: serverTimestamp()
    });
  }

  subscribeToReadReceipts(
    chatId: string,
    messageId: string,
    callback: (receipts: MessageReadReceipt[]) => void
  ): () => void {
    const receiptsRef = ref(database, `read_receipts/${chatId}/${messageId}`);
    
    const listener = onValue(receiptsRef, (snapshot: DataSnapshot) => {
      const receiptsData = snapshot.val() || {};
      const receipts: MessageReadReceipt[] = Object.values(receiptsData);
      callback(receipts);
    });

    return () => off(receiptsRef, 'value', listener);
  }

  // Batch read receipts for multiple messages
  async markMultipleMessagesAsRead(
    chatId: string,
    messageIds: string[],
    userId: string
  ): Promise<void> {
    const promises = messageIds.map(messageId => 
      this.markMessageAsRead(chatId, messageId, userId)
    );
    
    await Promise.all(promises);
  }

  // Connection status
  subscribeToConnectionStatus(callback: (isConnected: boolean) => void): () => void {
    const connectedRef = ref(database, '.info/connected');
    
    const listener = onValue(connectedRef, (snapshot: DataSnapshot) => {
      const connected = snapshot.val();
      callback(connected === true);
    });

    return () => off(connectedRef, 'value', listener);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Remove presence
    if (this.presenceRef) {
      await remove(this.presenceRef);
      this.presenceRef = null;
    }
  }

  // Chat activity (for "last seen" in chat)
  async updateChatActivity(chatId: string, userId: string): Promise<void> {
    const activityRef = ref(database, `chat_activity/${chatId}/${userId}`);
    
    await set(activityRef, {
      userId,
      lastActive: serverTimestamp()
    });
  }

  subscribeToChatActivity(
    chatId: string,
    callback: (activity: { userId: string; lastActive: number }[]) => void
  ): () => void {
    const activityRef = ref(database, `chat_activity/${chatId}`);
    
    const listener = onValue(activityRef, (snapshot: DataSnapshot) => {
      const activityData = snapshot.val() || {};
      const activity = Object.values(activityData) as { userId: string; lastActive: number }[];
      callback(activity);
    });

    return () => off(activityRef, 'value', listener);
  }

  // Message reactions (if needed)
  async addMessageReaction(
    chatId: string,
    messageId: string,
    userId: string,
    reaction: string
  ): Promise<void> {
    const reactionRef = ref(database, `message_reactions/${chatId}/${messageId}/${userId}`);
    
    await set(reactionRef, {
      userId,
      reaction,
      timestamp: serverTimestamp()
    });
  }

  async removeMessageReaction(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const reactionRef = ref(database, `message_reactions/${chatId}/${messageId}/${userId}`);
    await remove(reactionRef);
  }

  subscribeToMessageReactions(
    chatId: string,
    messageId: string,
    callback: (reactions: { userId: string; reaction: string; timestamp: number }[]) => void
  ): () => void {
    const reactionsRef = ref(database, `message_reactions/${chatId}/${messageId}`);
    
    const listener = onValue(reactionsRef, (snapshot: DataSnapshot) => {
      const reactionsData = snapshot.val() || {};
      const reactions = Object.values(reactionsData) as { userId: string; reaction: string; timestamp: number }[];
      callback(reactions);
    });

    return () => off(reactionsRef, 'value', listener);
  }
}