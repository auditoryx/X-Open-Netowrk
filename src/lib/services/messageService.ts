// Core messaging service for general creator-client communication
// Extends existing booking chat to support standalone conversations

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  lastMessage: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
  unreadCount: { [userId: string]: number };
}

export class MessageService {
  private db = getFirestore(app);

  // Create or get existing thread between two users
  async getOrCreateThread(currentUserId: string, otherUserId: string, otherUserName: string, currentUserName: string): Promise<string> {
    const threadsRef = collection(this.db, 'messageThreads');
    
    // Try to find existing thread
    const q = query(
      threadsRef,
      where('participants', 'array-contains', currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Check if any thread contains both users
    let existingThread = null;
    querySnapshot.forEach((doc) => {
      const thread = doc.data() as MessageThread;
      if (thread.participants.includes(otherUserId)) {
        existingThread = { id: doc.id, ...thread };
      }
    });

    if (existingThread) {
      return existingThread.id;
    }

    // Create new thread
    const newThread: Omit<MessageThread, 'id'> = {
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUserName,
        [otherUserId]: otherUserName
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp() as Timestamp,
      createdAt: serverTimestamp() as Timestamp,
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0
      }
    };

    const docRef = await addDoc(threadsRef, newThread);
    return docRef.id;
  }

  // Send a message in a thread
  async sendMessage(
    threadId: string,
    senderId: string,
    receiverId: string,
    text: string,
    mediaUrl?: string
  ): Promise<void> {
    const messagesRef = collection(this.db, 'messageThreads', threadId, 'messages');
    
    const message: Omit<Message, 'id'> = {
      threadId,
      senderId,
      receiverId,
      text,
      mediaUrl,
      createdAt: serverTimestamp() as Timestamp,
      isRead: false
    };

    // Add message
    await addDoc(messagesRef, message);

    // Update thread with last message info
    const threadRef = doc(this.db, 'messageThreads', threadId);
    
    // Get current unread count for receiver
    const threadDoc = await getDoc(threadRef);
    const currentThread = threadDoc.data() as MessageThread;
    const currentUnreadCount = currentThread?.unreadCount?.[receiverId] || 0;
    
    await updateDoc(threadRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${receiverId}`]: currentUnreadCount + 1
    });

    // Send notification to receiver
    this.sendMessageNotification(receiverId, senderId, text, threadId);
  }

  // Listen to messages in a thread
  listenToMessages(threadId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = collection(this.db, 'messageThreads', threadId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages);
    });
  }

  // Get user's message threads
  async getUserThreads(userId: string): Promise<MessageThread[]> {
    const threadsRef = collection(this.db, 'messageThreads');
    const q = query(
      threadsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const threads: MessageThread[] = [];
    
    querySnapshot.forEach((doc) => {
      threads.push({ id: doc.id, ...doc.data() } as MessageThread);
    });

    return threads;
  }

  // Listen to user's message threads with real-time updates
  listenToUserThreads(userId: string, callback: (threads: MessageThread[]) => void): () => void {
    const threadsRef = collection(this.db, 'messageThreads');
    const q = query(
      threadsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const threads: MessageThread[] = [];
      snapshot.forEach((doc) => {
        threads.push({ id: doc.id, ...doc.data() } as MessageThread);
      });
      callback(threads);
    });
  }

  // Mark messages as read
  async markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    const messagesRef = collection(this.db, 'messageThreads', threadId, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, {
          isRead: true,
          readAt: serverTimestamp()
        })
      );
    });

    await Promise.all(updatePromises);

    // Reset unread count for this user
    const threadRef = doc(this.db, 'messageThreads', threadId);
    await updateDoc(threadRef, {
      [`unreadCount.${userId}`]: 0
    });
  }

  // Send notification (integrate with existing notification system)
  private async sendMessageNotification(
    receiverId: string,
    senderId: string,
    messageText: string,
    threadId: string
  ): Promise<void> {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUid: receiverId,
          type: 'message',
          payload: {
            title: 'New Message',
            message: messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''),
            senderId,
            threadId,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Failed to send message notification:', error);
    }
  }
}

// Singleton instance
export const messageService = new MessageService();
