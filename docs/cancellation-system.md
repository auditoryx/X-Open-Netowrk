# Cancellation & Refund System

## Overview

The AuditoryX cancellation system implements time-based refund policies that protect both clients and creators while encouraging responsible booking behavior.

## Features

✅ **Time-based refund calculation** - Automatic refund percentage based on cancellation timing
✅ **Stripe integration** - Automated refund processing through Stripe
✅ **Audit trail** - Complete cancellation history for dispute resolution
✅ **User-friendly UI** - Clear refund preview before confirmation
✅ **Comprehensive testing** - 22 test cases covering all scenarios

## Cancellation Policies

| Time Before Booking | Refund Percentage | Description |
|---------------------|-------------------|-------------|
| 72+ hours | 100% | Full refund for early cancellations |
| 48-72 hours | 75% | Partial penalty for short notice |
| 24-48 hours | 50% | Moderate penalty for late notice |
| 2-24 hours | 25% | High penalty for very late notice |
| < 2 hours | 0% | No refund for last-minute cancellations |

## API Endpoints

### GET `/api/bookings/[id]/cancel`
Get cancellation quote without actually cancelling.

**Response:**
```json
{
  "bookingId": "string",
  "canCancel": boolean,
  "refundCalculation": {
    "originalAmount": number,
    "refundAmount": number,
    "refundPercentage": number,
    "timeUntilBooking": number,
    "policyApplied": {
      "description": "string",
      "hoursBeforeBooking": number
    }
  },
  "refundSummary": {
    "summary": "string",
    "details": ["string"],
    "netRefund": number
  }
}
```

### POST `/api/bookings/[id]/cancel`
Process actual cancellation and refund.

**Request:**
```json
{
  "reason": "string", // Required: 1-500 characters
  "confirmRefund": boolean // true to process, false for quote only
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "string",
  "status": "cancelled",
  "refundResult": {
    "refundId": "string",
    "amount": number,
    "status": "succeeded" | "pending" | "failed"
  },
  "message": "string"
}
```

## Usage Examples

### React Component Integration

```tsx
import { CancellationDialog } from '@/components/booking/CancellationDialog';

function BookingDetails({ bookingId, bookingTitle }) {
  const [showCancel, setShowCancel] = useState(false);

  const handleCancellationComplete = (result) => {
    console.log('Booking cancelled:', result);
    // Refresh booking data, show success message, etc.
  };

  return (
    <div>
      <Button onClick={() => setShowCancel(true)}>
        Cancel Booking
      </Button>
      
      <CancellationDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        bookingId={bookingId}
        bookingTitle={bookingTitle}
        onCancellationComplete={handleCancellationComplete}
      />
    </div>
  );
}
```

### API Usage

```typescript
// Get cancellation quote
const response = await fetch(`/api/bookings/${bookingId}/cancel`);
const quote = await response.json();

if (quote.canCancel) {
  console.log(`Refund: $${quote.refundSummary.netRefund}`);
  
  // Process cancellation
  await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reason: 'Emergency came up',
      confirmRefund: true
    })
  });
}
```

## Implementation Details

### Refund Calculation
- **Platform Fee Refund**: 20% platform fee is refunded proportionally
- **Processing Fee**: 3% of refund amount, capped at $5.00
- **Net Refund**: Gross refund minus processing fee

### Validation Rules
- Only booking participants (client or provider) can cancel
- Cannot cancel past bookings
- Cannot cancel already cancelled/completed bookings
- Cancellation reason is required (1-500 characters)

### Security Features
- Session-based authentication required
- Authorization checks for booking access
- Input validation with Zod schemas
- Comprehensive error handling
- Audit trail for all cancellations

### Error Handling
- Graceful degradation if Stripe refund fails
- Booking still marked as cancelled even if refund processing fails
- Clear error messages for user troubleshooting
- Support contact information provided for failed refunds

## Testing

Run cancellation system tests:
```bash
npm test -- --testPathPattern=refund-calculator
```

All 22 test cases cover:
- Refund percentage calculations for all time periods
- Processing fee calculations and caps
- Platform fee refund calculations
- Error handling for invalid bookings
- Edge cases (past bookings, zero refunds, etc.)

## Database Schema Updates

The `BookingSchema` now includes cancellation fields:
- `cancelledAt`: Timestamp of cancellation
- `cancelledBy`: User ID who initiated cancellation
- `cancellationReason`: User-provided reason
- `refundCalculation`: Calculated refund details
- `refundResult`: Stripe refund response
- `refundError`: Any refund processing errors

## Future Enhancements

1. **Admin Override**: Allow admins to process manual refunds
2. **Partial Refunds**: Support custom refund amounts
3. **Dispute System**: Integration with dispute resolution workflow
4. **Email Notifications**: Automated cancellation confirmation emails
5. **Analytics**: Cancellation rate tracking and policy optimization