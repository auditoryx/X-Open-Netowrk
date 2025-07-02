# Contract Preview Feature Documentation

## Overview
The Contract Preview feature provides clients with a professional contract review page before proceeding to payment, improving trust, transparency, and professionalism in the booking process.

## Files Created

### 1. `/src/app/booking/preview/[bookingId]/page.tsx`
**Route**: `/booking/preview/{bookingId}`
- Dynamic route for contract preview
- Fetches booking and user profile data
- Handles authentication and authorization
- Integrates with Stripe checkout API

### 2. `/src/components/booking/ContractPreview.tsx`
**Component**: Professional contract preview with:
- Service summary (provider, client, date, time, location, price)
- Scrollable contract terms section
- Scroll-to-bottom gate (must scroll to enable payment)
- Terms agreement checkbox
- Secure payment button with loading states
- Professional styling and responsive design

### 3. `/src/lib/firestore/getBookingById.ts`
**Helper**: Firestore function to fetch complete booking data
- Returns typed `BookingData` interface
- Includes all booking fields needed for contract display
- Error handling and null safety

### 4. Enhanced `/src/app/booking/[bookingId]/page.tsx`
**Addition**: "Review Contract & Pay" button for accepted bookings
- Only shows for clients when booking status is "accepted"
- Styled with gradient button design
- Redirects to contract preview page

## User Flow

### For Clients:
1. **Booking Request**: Client sends booking request via BookingForm
2. **Provider Accepts**: Provider accepts the booking (status: "accepted")
3. **Contract Review**: Client sees "Review Contract & Pay" button on booking details
4. **Preview Contract**: Client clicks button → redirects to `/booking/preview/{id}`
5. **Review Terms**: Client reviews service details and contract terms
6. **Scroll & Agree**: Client must scroll to bottom and check agreement box
7. **Payment**: Client clicks "Proceed to Payment" → Stripe checkout
8. **Completion**: After payment, booking status updates to "paid"

### For Providers:
- Providers can also view contract preview page
- Shows same contract terms the client will see
- Cannot proceed to payment (only clients can pay)

## Features

### Security & UX
- ✅ Authentication required
- ✅ Authorization check (only client/provider can view)
- ✅ Scroll-to-bottom gate prevents accidental payments
- ✅ Terms agreement checkbox required
- ✅ Loading states for all async operations
- ✅ Error handling with user-friendly messages

### Contract Content
- ✅ Auto-generated professional contract template
- ✅ Dynamic service details (name, date, time, location, price)
- ✅ Provider and client information
- ✅ Standard terms and conditions
- ✅ Support for custom contract terms (via `booking.contractTerms`)

### Styling
- ✅ Professional gradient header
- ✅ Clean grid layout for service summary
- ✅ Scrollable contract terms box
- ✅ Responsive design for mobile/desktop
- ✅ Dark mode support
- ✅ Payment protection info section

## API Integration

### Stripe Checkout
- Uses existing `/api/create-checkout-session` route
- Passes booking ID, amount, buyer email, and provider ID
- Redirects to Stripe hosted checkout page
- Returns to dashboard after successful payment

### Firestore Data
- Fetches booking from `bookings/{id}` collection
- Fetches user profiles from `users/{id}` collection
- Supports all existing booking data fields
- Backward compatible with existing booking structure

## Contract Terms

### Default Template
If no custom contract terms are set, generates professional template including:
- Service agreement header
- Service details (title, date, time, location, price)
- Payment terms (escrow, release conditions)
- Cancellation policy
- Service delivery expectations
- Intellectual property rights
- Confidentiality agreement
- Dispute resolution process
- Platform fees disclosure
- Provider and client information

### Custom Terms
- Providers can set custom `contractTerms` field in booking document
- Custom terms override default template
- Supports Markdown formatting
- Preserves all dynamic service details

## Testing

### To Test the Feature:
1. Create a booking request as a client
2. Accept the booking as a provider (set status to "accepted")
3. Navigate to `/booking/{bookingId}` as the client
4. Click "Review Contract & Pay" button
5. Verify contract preview page loads with correct data
6. Test scroll-to-bottom and agreement checkbox behavior
7. Test payment flow integration

### Test URLs:
- Contract preview: `/booking/preview/{your-booking-id}`
- Booking details: `/booking/{your-booking-id}`

## Future Enhancements
- [ ] Electronic signature integration
- [ ] Contract version history
- [ ] Custom contract templates per provider
- [ ] Contract amendment workflow
- [ ] PDF download/email functionality
- [ ] Multi-language contract support

## Dependencies
- Next.js 15+ (App Router)
- Firebase/Firestore
- Stripe integration
- Tailwind CSS
- Lucide React icons
- React hooks for state management
