/**
 * Utility functions to create sample notifications and bookings for testing
 * This is a development utility file for testing the Booking Inbox and Notification Bell components
 */

import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface SampleNotification {
  type: 'booking' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
  data?: {
    bookingId?: string;
    messageThreadId?: string;
    userId?: string;
    url?: string;
  };
}

export interface SampleBooking {
  clientUid: string;
  providerUid: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  clientName: string;
  providerName: string;
  lastMessageAt?: Timestamp;
}

/**
 * Create sample notifications for testing
 */
export async function createSampleNotifications(userId: string): Promise<void> {
  const db = getFirestore(app);
  
  const sampleNotifications: Omit<SampleNotification, 'createdAt'>[] = [
    {
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your booking for "Audio Mixing Session" has been confirmed for tomorrow at 2 PM.',
      isRead: false,
      data: { bookingId: 'booking_001' }
    },
    {
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Alex regarding your upcoming session.',
      isRead: false,
      data: { messageThreadId: 'thread_001' }
    },
    {
      type: 'system',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated with new skills.',
      isRead: true,
      data: { url: '/dashboard/profile' }
    },
    {
      type: 'reminder',
      title: 'Upcoming Session',
      message: 'You have a recording session scheduled in 1 hour.',
      isRead: false,
      data: { bookingId: 'booking_002' }
    },
    {
      type: 'booking',
      title: 'New Booking Request',
      message: 'Sarah wants to book you for a podcast recording session.',
      isRead: false,
      data: { bookingId: 'booking_003' }
    }
  ];

  // Create notifications collection for user
  const notificationsRef = collection(db, 'notifications', userId, 'items');
  
  for (const notification of sampleNotifications) {
    await addDoc(notificationsRef, {
      ...notification,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random time in last 7 days
    });
  }

  console.log(`Created ${sampleNotifications.length} sample notifications for user ${userId}`);
}

/**
 * Create sample bookings for testing
 */
export async function createSampleBookings(userId: string): Promise<void> {
  const db = getFirestore(app);
  
  const sampleBookings: Omit<SampleBooking, 'createdAt' | 'updatedAt' | 'scheduledDate' | 'lastMessageAt'>[] = [
    {
      clientUid: userId,
      providerUid: 'provider_001',
      serviceName: 'Audio Mixing Session',
      status: 'confirmed',
      clientName: 'You',
      providerName: 'Alex Johnson'
    },
    {
      clientUid: 'client_001',
      providerUid: userId,
      serviceName: 'Podcast Recording',
      status: 'pending',
      clientName: 'Sarah Wilson',
      providerName: 'You'
    },
    {
      clientUid: userId,
      providerUid: 'provider_002',
      serviceName: 'Beat Production',
      status: 'in-progress',
      clientName: 'You',
      providerName: 'Mike Chen'
    },
    {
      clientUid: 'client_002',
      providerUid: userId,
      serviceName: 'Voice Over Work',
      status: 'completed',
      clientName: 'Emma Davis',
      providerName: 'You'
    }
  ];

  // Create bookings collection
  const bookingsRef = collection(db, 'bookings');
  
  for (const booking of sampleBookings) {
    const now = new Date();
    const scheduledDate = new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000); // Random date in next 14 days
    const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
    const lastMessageAt = new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000); // Random date in last 3 days

    await addDoc(bookingsRef, {
      ...booking,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(lastMessageAt),
      lastMessageAt: Timestamp.fromDate(lastMessageAt)
    });
  }

  console.log(`Created ${sampleBookings.length} sample bookings for user ${userId}`);
}

/**
 * Create sample message threads for testing
 */
export async function createSampleMessageThreads(userId: string): Promise<void> {
  const db = getFirestore(app);
  
  const sampleThreads = [
    {
      participants: [userId, 'provider_001'],
      lastMessage: {
        content: 'Looking forward to our session tomorrow!',
        senderId: 'provider_001',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)) // 2 hours ago
      },
      unreadCounts: {
        [userId]: 1
      },
      bookingId: 'booking_001'
    },
    {
      participants: [userId, 'client_001'],
      lastMessage: {
        content: 'Can we reschedule to next week?',
        senderId: 'client_001',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)) // 6 hours ago
      },
      unreadCounts: {
        [userId]: 2
      },
      bookingId: 'booking_003'
    }
  ];

  // Create message threads collection
  const threadsRef = collection(db, 'messageThreads');
  
  for (const thread of sampleThreads) {
    await addDoc(threadsRef, thread);
  }

  console.log(`Created ${sampleThreads.length} sample message threads for user ${userId}`);
}

/**
 * Initialize all sample data for testing
 */
export async function initializeSampleData(userId: string): Promise<void> {
  try {
    await createSampleNotifications(userId);
    await createSampleBookings(userId);
    await createSampleMessageThreads(userId);
    console.log('✅ Sample data created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Export for use in browser console or test scripts
if (typeof window !== 'undefined') {
  (window as any).createSampleData = {
    initializeSampleData,
    createSampleNotifications,
    createSampleBookings,
    createSampleMessageThreads
  };
}
