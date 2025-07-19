# Split Studio Session Booking System

A comprehensive booking system that allows two users to co-book studio sessions, split costs, and invite talent to collaborate.

## 🎯 Overview

The Split Studio Session Booking System enables collaborative music creation by allowing:
- **Dual Client Booking**: Two users can co-book the same studio session
- **Flexible Cost Splitting**: Customizable cost ratios (50/50, 70/30, etc.)
- **Talent Requests**: Invite specific artists, producers, or engineers
- **Real-time Updates**: Live status tracking and notifications
- **Integrated Payments**: Stripe integration for separate payments

## 📁 File Structure

```
src/
├── lib/
│   ├── types/
│   │   └── Booking.ts                    # Extended booking types
│   ├── firestore/
│   │   ├── createSplitBooking.ts         # Create split bookings
│   │   ├── getSplitBookings.ts           # Fetch split bookings
│   │   └── requestTalentForBooking.ts    # Talent request/response
│   ├── hooks/
│   │   └── useSplitBookingUpdates.ts     # Real-time updates hook
│   └── stripe/
│       └── splitBookingPayments.ts       # Stripe integration
├── components/
│   ├── booking/
│   │   ├── SplitBookingForm.tsx          # Create split sessions
│   │   └── TalentRequestModal.tsx        # Talent invite responses
│   ├── dashboard/
│   │   ├── SplitBookingCard.tsx          # Booking display card
│   │   └── SplitBookingsList.tsx         # Manage all sessions
│   └── notifications/
│       └── SplitBookingNotification.tsx  # Notification display
└── pages/
    └── split-booking-demo.tsx            # Demo page
```

## 🚀 Features

### 1. Split Booking Creation
- **Studio Selection**: Choose from available studios
- **Date/Time Booking**: Select session date and duration
- **Collaborator Invite**: Invite by email or user ID
- **Cost Split Configuration**: Adjust ratio with visual slider
- **Talent Requests**: Optional artist/producer/engineer invites

### 2. Real-time Collaboration
- **Live Status Updates**: See confirmations instantly
- **Notification System**: Alerts for all parties
- **Payment Tracking**: Monitor payment status for both clients
- **Talent Responses**: Track talent acceptance/rejection

### 3. Payment Integration
- **Stripe Checkout**: Separate payment sessions for each client
- **Automatic Calculations**: Cost split with rounding handling
- **Payment Status Tracking**: Individual payment monitoring
- **Refund Support**: Handle cancellations and refunds

### 4. Dashboard Integration
- **Unified View**: All split sessions in one place
- **Status Filtering**: Filter by pending, confirmed, completed
- **Quick Actions**: Pay, view details, cancel options
- **Real-time Updates**: Live status without page refresh

## 🛠 Implementation Details

### Data Structure

```typescript
interface SplitBooking {
  id?: string;
  studioId: string;
  clientAUid: string;
  clientBUid: string;
  splitRatio: number;              // 0.5 = 50/50, 0.7 = 70/30
  requestedTalent?: {
    artistId?: string;
    producerId?: string;
    engineerId?: string;
  };
  talentStatus?: {
    artist?: 'pending' | 'accepted' | 'rejected';
    producer?: 'pending' | 'accepted' | 'rejected';
    engineer?: 'pending' | 'accepted' | 'rejected';
  };
  status: 'pending' | 'confirmed' | 'in_session' | 'completed' | 'cancelled';
  totalCost: number;
  clientAShare: number;
  clientBShare: number;
  clientAPaymentStatus?: 'pending' | 'paid' | 'refunded';
  clientBPaymentStatus?: 'pending' | 'paid' | 'refunded';
  stripeSessionIds?: {
    clientA?: string;
    clientB?: string;
  };
  // ... additional fields
}
```

### Firestore Collections

```
/splitBookings/{bookingId}     # Main booking documents
/notifications/{uid}/userNotifications/{notificationId}  # User notifications
```

### Helper Functions

```typescript
// Check if user is part of booking
isUserInSplitBooking(booking: SplitBooking, uid: string): boolean

// Get user's role in booking
getUserRoleInBooking(booking: SplitBooking, uid: string): 'clientA' | 'clientB' | null

// Calculate payment shares
calculatePaymentShares(totalCost: number, splitRatio: number): { clientAShare: number, clientBShare: number }
```

## 📋 Usage Examples

### Creating a Split Booking

```tsx
import { SplitBookingForm } from '@/src/components/booking/SplitBookingForm';

<SplitBookingForm
  studios={availableStudios}
  onBookingCreated={(bookingId) => {
    console.log('Booking created:', bookingId);
    // Navigate to booking details or dashboard
  }}
  onCancel={() => {
    // Handle cancellation
  }}
/>
```

### Displaying Split Bookings

```tsx
import { SplitBookingsList } from '@/src/components/dashboard/SplitBookingsList';

<SplitBookingsList
  limit={5}                    // Optional: limit displayed bookings
  showHeader={true}            // Show header with filters and create button
  onCreateNew={() => {
    // Handle create new booking
  }}
/>
```

### Talent Request Response

```tsx
import { TalentRequestModal } from '@/src/components/booking/TalentRequestModal';

<TalentRequestModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  bookingId="booking-123"
  talentRole="producer"
  onResponseSubmitted={(response) => {
    console.log('Talent response:', response);
  }}
/>
```

### Real-time Updates

```tsx
import { useSplitBookingUpdates } from '@/src/lib/hooks/useSplitBookingUpdates';

function BookingDetails({ bookingId }) {
  const { booking, notifications, loading, error } = useSplitBookingUpdates({
    bookingId,
    includeNotifications: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{booking?.sessionTitle}</h1>
      <p>Status: {booking?.status}</p>
      {/* Render booking details */}
    </div>
  );
}
```

### Payment Integration

```tsx
import { createSplitBookingCheckout, formatCurrency } from '@/src/lib/stripe/splitBookingPayments';

async function handlePayment(booking: SplitBooking, isClientA: boolean) {
  const { clientAShareCents, clientBShareCents } = calculateSplitPayments(booking);
  const amount = isClientA ? clientAShareCents : clientBShareCents;
  
  const { successUrl, cancelUrl } = createPaymentUrls(booking.id!);
  
  const session = await createSplitBookingCheckout({
    bookingId: booking.id!,
    clientUid: user.uid,
    amount,
    isClientA,
    successUrl,
    cancelUrl
  });
  
  // Redirect to Stripe checkout
  window.location.href = session.url;
}
```

## 🔔 Notification System

The system includes comprehensive notifications for:

- **Split Booking Invites**: When invited to join a session
- **Booking Confirmations**: When both parties confirm
- **Talent Requests**: When invited to join as talent
- **Talent Responses**: When talent accepts/rejects
- **Payment Required**: When payment is needed
- **Session Reminders**: Before session starts

### Notification Types

```typescript
type NotificationType = 
  | 'split_booking_invite'
  | 'split_booking_confirmed'
  | 'split_booking_cancelled'
  | 'talent_request'
  | 'talent_response'
  | 'payment_required'
  | 'session_reminder';
```

## 💳 Payment Flow

1. **Booking Creation**: Total cost calculated, split into shares
2. **Confirmation**: Both clients confirm participation
3. **Payment Requests**: Separate Stripe sessions created
4. **Individual Payments**: Each client pays their share
5. **Session Confirmation**: When both payments complete
6. **Refund Handling**: If session cancelled

### Payment Status Tracking

```typescript
// Check if client needs to pay
clientNeedsPayment(booking: SplitBooking, clientUid: string): boolean

// Check if booking is fully paid
isSplitBookingFullyPaid(booking: SplitBooking): boolean

// Get client's payment details
getClientPaymentStatus(booking: SplitBooking, clientUid: string)
```

## 🎨 UI Components

### SplitBookingCard
Displays booking information with:
- Session details (date, time, studio)
- Payment status and amounts
- Talent requests and responses
- Action buttons (pay, view, cancel)

### SplitBookingForm
Comprehensive form for creating split bookings:
- Studio selection with rates
- Date/time picker
- Collaborator search and invite
- Cost split ratio slider
- Talent request interface

### TalentRequestModal
Modal for talent to respond to invites:
- Session details display
- Accept/reject buttons
- Optional response message
- Real-time status updates

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... other Firebase config
```

### Firestore Security Rules
```javascript
// Allow split booking read/write for participants
match /splitBookings/{bookingId} {
  allow read, write: if request.auth != null && 
    (resource.data.clientAUid == request.auth.uid || 
     resource.data.clientBUid == request.auth.uid ||
     resource.data.requestedTalent.artistId == request.auth.uid ||
     resource.data.requestedTalent.producerId == request.auth.uid ||
     resource.data.requestedTalent.engineerId == request.auth.uid);
}
```

## 🧪 Testing

The system includes comprehensive test coverage:
- Unit tests for helper functions
- Integration tests for Firestore operations
- Component tests for UI interactions
- End-to-end tests for complete workflows

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 🚀 Deployment

1. **Firebase Setup**: Configure Firestore and Authentication
2. **Stripe Configuration**: Set up webhook endpoints
3. **Environment Variables**: Configure all required keys
4. **Security Rules**: Deploy Firestore security rules
5. **Build & Deploy**: Deploy to your hosting platform

## 📈 Analytics & Monitoring

Track key metrics:
- Split booking creation rate
- Confirmation rate (both clients accept)
- Talent acceptance rate
- Payment completion rate
- Session completion rate

## 🔮 Future Enhancements

- **Group Bookings**: Support for 3+ participants
- **Recurring Sessions**: Schedule regular split sessions
- **Talent Discovery**: In-app talent search and profiles
- **Session Recording**: Integration with recording platforms
- **Review System**: Post-session feedback and ratings
- **Calendar Integration**: Sync with external calendars

## 📞 Support

For questions or issues:
- Check the demo page at `/split-booking-demo`
- Review the component documentation
- Test with the provided mock data
- Monitor Firestore logs for debugging

---

Built with ❤️ for collaborative music creation
