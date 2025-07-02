# Booking Confirmation Email System

## Overview

The booking confirmation email system sends professional confirmation emails to both clients and providers when a booking is confirmed. It includes booking details, contract links (if applicable), and calendar integration.

## Features

✅ **Dual Email Delivery**: Sends customized emails to both client and provider
✅ **Contract Integration**: Includes contract download links for revenue-split bookings  
✅ **Calendar Support**: Generates `.ics` calendar files for easy calendar import
✅ **Professional Design**: Modern, responsive email templates
✅ **Smart Formatting**: Relative dates, currency formatting, and personalized content
✅ **Error Handling**: Comprehensive error handling and logging

## API Usage

### Confirm Booking and Send Emails

```typescript
POST /api/booking/confirm

// Request body
{
  "bookingId": "booking-12345",
  "contractUrl": "https://auditoryx.com/contracts/contract-789.pdf" // optional
}

// Response
{
  "success": true,
  "message": "Booking confirmed and emails sent successfully",
  "booking": {
    "id": "booking-12345",
    "status": "confirmed", 
    "emailsSent": 2,
    "recipients": ["client@example.com", "provider@example.com"]
  }
}
```

### Direct Email Function Usage

```typescript
import { sendBookingConfirmationEmail } from '../lib/email/sendBookingConfirmationEmail';

const bookingData = {
  id: 'booking-123',
  status: 'confirmed',
  totalAmount: 15000,
  bookingDate: '2025-07-18',
  startTime: '14:00',
  clientName: 'Yuki Tanaka',
  clientEmail: 'yuki@example.com',
  providerName: 'Alex Johnson', 
  providerEmail: 'alex@example.com',
  serviceName: 'Music Production',
  contractUrl: 'https://example.com/contract.pdf' // optional
};

// Send to both client and provider
await sendBookingConfirmationEmail(bookingData);

// Or send to single recipient
await sendSingleBookingConfirmation('client@example.com', bookingData, 'client');
```

## Email Content

### Client Email
- **Subject**: "🎉 Booking Confirmed: [Service] with [Provider]"
- **Summary**: "You're confirmed to work with [Provider] on [Date]"
- **Next Steps**: Client-focused action items
- **Contract Link**: If revenue split is enabled

### Provider Email  
- **Subject**: "🎵 New Booking: [Service] with [Client]"
- **Summary**: "You're confirmed to work with [Client] on [Date]"
- **Next Steps**: Provider-focused action items
- **Contract Link**: If revenue split is enabled

### Common Content
- Booking details (date, location, amount)
- Calendar download (.ics file)
- Payment security notice
- Support contact information

## Required Data Fields

### Booking Information
```typescript
interface BookingConfirmationData {
  id: string;                    // Booking ID
  totalAmount: number;           // Total price in yen
  bookingDate: string;           // ISO date string
  startTime?: string;            // "14:00" format
  endTime?: string;              // "16:00" format  
  location?: string;             // Session location
  notes?: string;                // Additional notes
  
  clientName: string;            // Client display name
  clientEmail: string;           // Client email address
  
  providerName: string;          // Provider display name
  providerEmail: string;         // Provider email address
  
  serviceName: string;           // Service title
  serviceDescription?: string;   // Service description
  
  contractId?: string;           // Contract ID (optional)
  contractUrl?: string;          // Contract download URL (optional)
  revenueSplitEnabled?: boolean; // Revenue split flag
  
  stripeSessionId?: string;      // Payment reference
}
```

## Environment Variables

```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=booking@auditoryx.com
```

## Testing

Run the test script to validate email functionality:

```bash
node scripts/test-booking-email.js
```

This will send test emails to verify:
- Template rendering
- SendGrid integration
- Both client and provider email variants

## Error Handling

The system handles various error scenarios:

- **Missing API Key**: Clear error message with setup instructions
- **Invalid Booking ID**: 404 response with booking not found message  
- **Missing Email Addresses**: 400 response with validation error
- **SendGrid Failures**: Detailed error logging and user-friendly messages
- **Already Confirmed**: Prevents duplicate email sending

## Calendar Integration

Each email includes a downloadable `.ics` calendar file with:
- Event title: "[Service] - [Provider/Client]"  
- Start/end times based on booking data
- Location information
- Booking description and ID

## Template Customization

The email template (`templates/email/BookingConfirmed.html`) supports:

- **Responsive Design**: Mobile-friendly layout
- **Brand Colors**: AuditoryX color scheme
- **Variable Substitution**: `{{variableName}}` format
- **Conditional Sections**: Contract section only shows when applicable
- **Professional Styling**: Modern gradients and typography

## Integration Points

### From Stripe Webhooks
```typescript
// In your Stripe webhook handler
await fetch('/api/booking/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    bookingId: session.metadata.bookingId,
    contractUrl: session.metadata.contractUrl 
  })
});
```

### From Booking Completion Flow
```typescript
// After successful payment processing
const result = await fetch('/api/booking/confirm', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookingId })
});
```

## Monitoring

The system logs all email activities:
- ✅ Successful email delivery
- ❌ Failed email attempts  
- 📧 Recipient addresses
- 🔄 Booking status updates

Check your application logs for email delivery status and troubleshooting information.
