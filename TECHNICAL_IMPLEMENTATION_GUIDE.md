# 🛠️ Technical Implementation Guide - AuditoryX MVP

## 1. Google Calendar Integration

### OAuth Configuration
Update `src/lib/firebase/auth.ts`:

```typescript
// Add Google Calendar scope
const googleProvider = new GoogleProvider({
  id: 'google',
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar'
    }
  }
});
```

### Calendar Sync Service
Create `src/lib/google/calendarSync.ts`:

```typescript
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';

export class CalendarSyncService {
  private calendar: any;
  
  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async syncAvailability(userId: string): Promise<void> {
    const events = await this.getCalendarEvents();
    const busySlots = this.convertEventsToBusySlots(events);
    
    await adminDb.doc(`availability/${userId}`).update({
      busySlots,
      lastSynced: new Date().toISOString()
    });
  }

  async pushAvailability(userId: string, slots: AvailabilitySlot[]): Promise<void> {
    for (const slot of slots) {
      await this.createCalendarEvent(slot);
    }
  }

  private async getCalendarEvents() {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return response.data.items || [];
  }

  private async createCalendarEvent(slot: AvailabilitySlot) {
    const event = {
      summary: 'Available - AuditoryX',
      description: 'Available for booking through AuditoryX',
      start: {
        dateTime: slot.startTime,
        timeZone: slot.timezone
      },
      end: {
        dateTime: slot.endTime,
        timeZone: slot.timezone
      }
    };

    await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });
  }
}
```

### API Routes
Create `src/app/api/calendar/sync/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CalendarSyncService } from '@/lib/google/calendarSync';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const syncService = new CalendarSyncService(session.accessToken);
    await syncService.syncAvailability(session.user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

## 2. Escrow Payment System

### Stripe Connect Setup
Create `src/lib/stripe/connect.ts`:

```typescript
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripeConnectService {
  async createConnectAccount(userId: string, email: string): Promise<string> {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    await adminDb.doc(`users/${userId}`).update({
      stripeConnectId: account.id
    });

    return account.id;
  }

  async createAccountLink(accountId: string, userId: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/setup`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/success`,
      type: 'account_onboarding'
    });

    return accountLink.url;
  }
}
```

### Escrow Payment Processing
Create `src/lib/stripe/escrow.ts`:

```typescript
export class EscrowService {
  async createEscrowPayment(
    amount: number,
    providerId: string,
    bookingId: string
  ): Promise<string> {
    // Create payment intent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      transfer_group: bookingId,
      metadata: {
        bookingId,
        providerId,
        type: 'escrow'
      }
    });

    // Store escrow record
    await adminDb.collection('escrows').doc(bookingId).set({
      amount,
      providerId,
      bookingId,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      createdAt: new Date().toISOString()
    });

    return paymentIntent.client_secret!;
  }

  async releaseEscrow(bookingId: string): Promise<void> {
    const escrowDoc = await adminDb.doc(`escrows/${bookingId}`).get();
    const escrow = escrowDoc.data();

    if (!escrow) throw new Error('Escrow not found');

    const providerAmount = Math.floor(escrow.amount * 0.8); // 80% to provider
    const platformFee = escrow.amount - providerAmount; // 20% platform fee

    // Transfer to provider
    await stripe.transfers.create({
      amount: providerAmount * 100,
      currency: 'usd',
      destination: escrow.stripeConnectId,
      transfer_group: bookingId
    });

    // Update escrow status
    await adminDb.doc(`escrows/${bookingId}`).update({
      status: 'released',
      releasedAt: new Date().toISOString(),
      providerAmount,
      platformFee
    });
  }
}
```

## 3. Real-time Chat Features

### Firebase Realtime Database Setup
Create `src/lib/firebase/realtime.ts`:

```typescript
import { database } from '@/lib/firebase-admin';

export class RealtimeService {
  async updateTypingStatus(
    chatId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const ref = database().ref(`typing/${chatId}/${userId}`);
    
    if (isTyping) {
      await ref.set({
        isTyping: true,
        timestamp: Date.now()
      });
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        ref.remove();
      }, 3000);
    } else {
      await ref.remove();
    }
  }

  async updatePresence(userId: string, isOnline: boolean): Promise<void> {
    const ref = database().ref(`presence/${userId}`);
    
    await ref.set({
      isOnline,
      lastSeen: Date.now()
    });

    // Set offline when user disconnects
    ref.onDisconnect().set({
      isOnline: false,
      lastSeen: Date.now()
    });
  }

  subscribeToTyping(chatId: string, callback: (typingUsers: any[]) => void): () => void {
    const ref = database().ref(`typing/${chatId}`);
    
    const listener = ref.on('value', (snapshot) => {
      const typingData = snapshot.val() || {};
      const typingUsers = Object.entries(typingData).map(([userId, data]) => ({
        userId,
        ...data
      }));
      callback(typingUsers);
    });

    return () => ref.off('value', listener);
  }
}
```

### Typing Indicator Component
Create `src/components/chat/TypingIndicator.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { RealtimeService } from '@/lib/firebase/realtime';

interface TypingIndicatorProps {
  chatId: string;
  currentUserId: string;
}

export default function TypingIndicator({ chatId, currentUserId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const realtimeService = new RealtimeService();

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTyping(chatId, (users) => {
      const otherUsers = users.filter(u => u.userId !== currentUserId);
      setTypingUsers(otherUsers);
    });

    return unsubscribe;
  }, [chatId, currentUserId]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0].name} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </span>
    </div>
  );
}
```

### Enhanced Chat Hook
Create `src/hooks/useEnhancedChat.ts`:

```typescript
import { useEffect, useState } from 'react';
import { RealtimeService } from '@/lib/firebase/realtime';

export function useEnhancedChat(chatId: string, userId: string) {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUsersTyping, setOtherUsersTyping] = useState<any[]>([]);
  const realtimeService = new RealtimeService();

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTyping(chatId, (users) => {
      const others = users.filter(u => u.userId !== userId);
      setOtherUsersTyping(others);
    });

    return unsubscribe;
  }, [chatId, userId]);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      realtimeService.updateTypingStatus(chatId, userId, true);
    }
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      realtimeService.updateTypingStatus(chatId, userId, false);
    }
  };

  const updatePresence = (isOnline: boolean) => {
    realtimeService.updatePresence(userId, isOnline);
  };

  return {
    isTyping,
    otherUsersTyping,
    startTyping,
    stopTyping,
    updatePresence
  };
}
```

## 4. Interactive Map Discovery

### Enhanced Map Component
Update `src/app/map/page.tsx`:

```typescript
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAllCreators } from '@/lib/firestore/getAllCreators';
import { MapFilters } from '@/components/map/MapFilters';
import { CreatorCluster } from '@/components/map/CreatorCluster';

interface MapFilters {
  role: string[];
  priceRange: [number, number];
  availability: string;
  verified: boolean;
}

export default function EnhancedMapPage() {
  const mapContainer = useRef(null);
  const map = useRef<any>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<any[]>([]);
  const [filters, setFilters] = useState<MapFilters>({
    role: [],
    priceRange: [0, 1000],
    availability: 'all',
    verified: false
  });

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [creators, filters]);

  const loadCreators = async () => {
    const creatorData = await getAllCreators();
    setCreators(creatorData);
  };

  const applyFilters = () => {
    let filtered = creators;

    if (filters.role.length > 0) {
      filtered = filtered.filter(c => filters.role.includes(c.role));
    }

    if (filters.verified) {
      filtered = filtered.filter(c => c.verified);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(c => 
        c.price >= filters.priceRange[0] && c.price <= filters.priceRange[1]
      );
    }

    setFilteredCreators(filtered);
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 bg-white shadow-lg">
        <MapFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          resultCount={filteredCreators.length}
        />
      </div>
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full">
          <CreatorCluster 
            creators={filteredCreators}
            onCreatorClick={(creator) => {
              // Handle creator selection
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

## 5. Media Portfolio System

### Media Upload Component
Create `src/components/media/MediaUpload.tsx`:

```typescript
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadMedia } from '@/lib/media/upload';

interface MediaUploadProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export default function MediaUpload({ 
  onUploadComplete, 
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*']
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const uploadPromises = acceptedFiles.map(async (file) => {
      const progressCallback = (progress: number) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      };

      return uploadMedia(file, progressCallback);
    });

    try {
      const urls = await Promise.all(uploadPromises);
      onUploadComplete(urls);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <div className="text-blue-600">Uploading...</div>
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="text-sm">
                <div className="flex justify-between">
                  <span>{filename}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">Drag & drop files here, or click to select</p>
                <p className="text-sm text-gray-400">
                  Supports images and videos up to 100MB each
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Media Upload Service
Create `src/lib/media/upload.ts`:

```typescript
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { adminDb } from '@/lib/firebase-admin';

export async function uploadMedia(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storage = getStorage();
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `portfolio/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Save metadata to Firestore
        await adminDb.collection('media').add({
          url: downloadURL,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });

        resolve(downloadURL);
      }
    );
  });
}
```

## 6. Database Schema Updates

### Firestore Collections
```typescript
// New collections to create:

// typing_indicators
{
  chatId: string;
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

// user_presence
{
  userId: string;
  isOnline: boolean;
  lastSeen: number;
}

// escrows
{
  bookingId: string;
  amount: number;
  providerId: string;
  status: 'pending' | 'released' | 'refunded';
  paymentIntentId: string;
  createdAt: string;
  releasedAt?: string;
  providerAmount?: number;
  platformFee?: number;
}

// media
{
  id: string;
  userId: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  portfolioId?: string;
}

// calendar_syncs
{
  userId: string;
  lastSynced: string;
  syncStatus: 'success' | 'error';
  errorMessage?: string;
}
```

## 7. Environment Variables

Update `.env.example`:

```bash
# Existing variables...

# Google Calendar Integration
GOOGLE_CALENDAR_SCOPE=https://www.googleapis.com/auth/calendar

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=your_stripe_connect_client_id

# Firebase Realtime Database
FIREBASE_REALTIME_DATABASE_URL=your_firebase_realtime_url

# Media Upload
FIREBASE_STORAGE_BUCKET=your_storage_bucket
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=image/*,video/*
```

## 8. Testing Strategy

### Unit Tests
```typescript
// Example test for calendar sync
describe('CalendarSyncService', () => {
  it('should sync availability from Google Calendar', async () => {
    const service = new CalendarSyncService('mock-token');
    await service.syncAvailability('user123');
    
    // Verify availability was updated
    expect(mockFirestore.doc).toHaveBeenCalledWith('availability/user123');
  });
});
```

### Integration Tests
```typescript
// Example test for payment flow
describe('Payment Flow', () => {
  it('should process escrow payment correctly', async () => {
    const response = await fetch('/api/stripe/escrow', {
      method: 'POST',
      body: JSON.stringify({
        amount: 100,
        providerId: 'provider123',
        bookingId: 'booking456'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.clientSecret).toBeDefined();
  });
});
```

## 9. Performance Optimizations

### Database Queries
```typescript
// Optimize creator queries with indexes
const creatorsQuery = db.collection('users')
  .where('role', 'in', ['producer', 'engineer', 'artist'])
  .where('verified', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(50);
```

### Caching Strategy
```typescript
// Implement Redis caching for frequently accessed data
import { redis } from '@/lib/redis';

export async function getCachedCreators(): Promise<Creator[]> {
  const cached = await redis.get('creators:all');
  if (cached) return JSON.parse(cached);
  
  const creators = await getAllCreators();
  await redis.setex('creators:all', 300, JSON.stringify(creators)); // 5 min cache
  
  return creators;
}
```

---

This technical implementation guide provides the foundation for building the remaining MVP features. Each section includes working code examples that can be directly integrated into the existing codebase.