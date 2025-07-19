# Booking System Documentation

## Overview
The AuditoryX booking system handles creator-to-creator service bookings with integrated payments, escrow, and collaboration features.

## Booking Flow

### 1. Service Discovery
```
User searches for creators → Views profiles → Selects service → Initiates booking
```

### 2. Booking Creation
```
1. Service selection and customization
2. Date/time scheduling
3. Payment information
4. Booking confirmation
5. Escrow hold
6. Notification to provider
```

### 3. Service Delivery
```
1. Work begins (status: 'in-progress')
2. Communication via booking chat
3. File sharing and feedback
4. Revision requests (if needed)
5. Final delivery
```

### 4. Completion & Payment
```
1. Client approval
2. Escrow release
3. Revenue splitting (if applicable)
4. Review and rating
5. Booking closure
```

## Core Components

### Booking Entity (`/lib/types/Booking.ts`)
```typescript
interface Booking {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  
  // Booking details
  title: string;
  description: string;
  price: number;
  currency: string;
  
  // Scheduling
  scheduledDate: Date;
  estimatedDuration: number; // hours
  
  // Status tracking
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  
  // Collaboration
  teamMembers?: string[]; // for split bookings
  revenueSplit?: RevenueSplitConfig;
  
  // Communication
  chatThreadId: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### Booking Statuses
- **pending** - Awaiting provider confirmation
- **confirmed** - Provider accepted, payment held
- **in-progress** - Work has started
- **revision** - Client requested changes
- **completed** - Work finished, awaiting approval
- **approved** - Client approved, payment released
- **cancelled** - Booking cancelled
- **disputed** - Dispute raised

## Split Bookings

### Team Collaboration
Multiple creators can work on a single booking with automatic revenue splitting.

```typescript
interface RevenueSplitConfig {
  splits: {
    userId: string;
    percentage: number;
    role: string; // 'lead', 'collaborator', 'specialist'
  }[];
  autoSplit: boolean;
  escrowReleaseRule: 'unanimous' | 'majority' | 'lead-only';
}
```

### Implementation
```typescript
// Create split booking
const booking = await createSplitBooking({
  clientId: 'client-123',
  serviceId: 'service-456',
  teamMembers: [
    { userId: 'creator-1', role: 'lead', percentage: 60 },
    { userId: 'creator-2', role: 'mix-engineer', percentage: 40 }
  ]
});

// Handle revenue distribution
await distributeSplitPayment(bookingId, {
  totalAmount: 1000,
  splits: booking.revenueSplit.splits
});
```

## Payment Integration

### Escrow System
All payments are held in escrow until work completion:

```typescript
// Create payment intent with escrow
const paymentIntent = await stripe.paymentIntents.create({
  amount: booking.price * 100,
  currency: booking.currency,
  metadata: {
    bookingId: booking.id,
    holdUntil: booking.scheduledDate + booking.estimatedDuration
  }
});

// Release payment after approval
await releaseFunds(booking.id, {
  approved: true,
  approvedBy: booking.clientId,
  releaseAmount: booking.price
});
```

### Revenue Splitting
For split bookings, payments are automatically distributed:

```typescript
// Split payment to team members
const transfers = await Promise.all(
  booking.revenueSplit.splits.map(split => 
    stripe.transfers.create({
      amount: Math.round(booking.price * split.percentage / 100 * 100),
      currency: booking.currency,
      destination: split.stripeAccountId,
      metadata: {
        bookingId: booking.id,
        role: split.role
      }
    })
  )
);
```

## Booking Management

### Provider Dashboard
```typescript
// Get provider bookings
const bookings = await getProviderBookings(providerId, {
  status: ['confirmed', 'in-progress'],
  sortBy: 'scheduledDate'
});

// Update booking status
await updateBookingStatus(bookingId, 'in-progress', {
  updatedBy: providerId,
  notes: 'Started working on the project'
});
```

### Client Dashboard
```typescript
// Get client bookings
const bookings = await getClientBookings(clientId, {
  includeCompleted: false,
  sortBy: 'createdAt'
});

// Request revision
await requestRevision(bookingId, {
  feedback: 'Please adjust the mix levels',
  revisionsRemaining: 2
});
```

## Chat Integration

### Booking Communication
Each booking has an integrated chat thread:

```typescript
// Send message in booking chat
await sendBookingMessage(bookingId, {
  senderId: userId,
  content: 'Project files uploaded to shared folder',
  attachments: ['file-url-1', 'file-url-2']
});

// Get chat history
const messages = await getBookingMessages(bookingId, {
  limit: 50,
  beforeTimestamp: lastMessageTime
});
```

## File Sharing

### Project Assets
```typescript
// Upload project files
const fileUrl = await uploadBookingFile(bookingId, file, {
  category: 'stems', // 'reference', 'stems', 'final', 'feedback'
  uploadedBy: userId,
  permissions: ['client', 'provider'] // who can access
});

// Share files with team
await shareWithTeam(bookingId, fileUrl, {
  shareWith: booking.teamMembers,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
});
```

## Notifications

### Booking Updates
```typescript
// Send booking notification
await sendBookingNotification(bookingId, {
  type: 'status_change',
  recipients: [booking.clientId, booking.providerId],
  data: {
    oldStatus: 'confirmed',
    newStatus: 'in-progress',
    updatedBy: providerId
  }
});
```

### Email Notifications
- Booking confirmation
- Status updates
- Payment confirmations
- Completion notifications
- Review requests

## API Endpoints

### Booking Management
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/confirm` - Confirm booking
- `POST /api/bookings/:id/cancel` - Cancel booking

### Split Bookings
- `POST /api/bookings/split` - Create split booking
- `PUT /api/bookings/:id/team` - Update team members
- `POST /api/bookings/:id/distribute` - Distribute payment

### Communication
- `GET /api/bookings/:id/messages` - Get chat messages
- `POST /api/bookings/:id/messages` - Send message
- `POST /api/bookings/:id/files` - Upload file

## Error Handling

### Common Scenarios
1. **Payment failures** - Retry logic with exponential backoff
2. **Provider unavailability** - Alternative suggestions
3. **Client disputes** - Mediation process
4. **Technical issues** - Automatic rollback and notifications

### Monitoring
- Booking success rates
- Payment completion rates
- Average time to completion
- Customer satisfaction scores
