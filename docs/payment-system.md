# Payment System Documentation

## Overview
AuditoryX uses Stripe for payment processing with escrow functionality, revenue splitting, and marketplace payments via Stripe Connect.

## Payment Architecture

### Core Components
1. **Stripe Connect** - Marketplace payments
2. **Payment Intents** - Secure payment processing
3. **Escrow System** - Fund holding and release
4. **Revenue Splitting** - Automatic distribution
5. **Webhooks** - Event processing

## Payment Flow

### 1. Service Booking Payment
```
1. Client selects service and enters payment details
2. Payment Intent created with hold for escrow
3. Funds captured and held in platform account
4. Provider delivers service
5. Client approves work
6. Funds released to provider (minus platform fee)
```

### 2. Split Payment Flow
```
1. Team booking created with revenue split configuration
2. Total payment captured in escrow
3. Work completed by team
4. Client approves final deliverable
5. Payment automatically split according to configuration
6. Individual transfers to team member accounts
```

## Stripe Connect Setup

### Account Types
- **Standard Accounts** - Full Stripe dashboard access
- **Express Accounts** - Simplified onboarding
- **Custom Accounts** - Platform-controlled

### Onboarding Process
```typescript
// Create connected account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: user.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true }
  }
});

// Create account link for onboarding
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${baseUrl}/connect/reauth`,
  return_url: `${baseUrl}/connect/success`,
  type: 'account_onboarding'
});
```

## Escrow Implementation

### Fund Holding
```typescript
// Create payment with escrow hold
const paymentIntent = await stripe.paymentIntents.create({
  amount: booking.totalAmount * 100, // Convert to cents
  currency: 'usd',
  payment_method_types: ['card'],
  metadata: {
    bookingId: booking.id,
    holdUntil: booking.scheduledDate,
    escrow: 'true'
  }
});

// Confirm payment
const confirmedPayment = await stripe.paymentIntents.confirm(
  paymentIntent.id,
  { payment_method: paymentMethodId }
);
```

### Fund Release
```typescript
// Release funds to provider
const transfer = await stripe.transfers.create({
  amount: providerAmount * 100,
  currency: 'usd',
  destination: provider.stripeAccountId,
  metadata: {
    bookingId: booking.id,
    type: 'service_payment'
  }
});

// Update booking status
await updateBooking(booking.id, {
  paymentStatus: 'completed',
  transferId: transfer.id,
  completedAt: new Date()
});
```

## Revenue Splitting

### Split Configuration
```typescript
interface RevenueSplit {
  bookingId: string;
  totalAmount: number;
  platformFee: number; // percentage
  splits: {
    accountId: string;
    userId: string;
    amount: number;
    percentage: number;
    role: string;
  }[];
}
```

### Automatic Distribution
```typescript
async function distributeSplitPayment(bookingId: string) {
  const booking = await getBooking(bookingId);
  const splits = booking.revenueSplit.splits;
  
  // Calculate platform fee
  const platformFee = booking.totalAmount * PLATFORM_FEE_PERCENTAGE;
  const distributionAmount = booking.totalAmount - platformFee;
  
  // Create transfers for each team member
  const transfers = await Promise.all(
    splits.map(split => 
      stripe.transfers.create({
        amount: Math.round(distributionAmount * split.percentage / 100 * 100),
        currency: 'usd',
        destination: split.accountId,
        metadata: {
          bookingId,
          userId: split.userId,
          role: split.role
        }
      })
    )
  );
  
  return transfers;
}
```

## Subscription Management

### Creator Tier Subscriptions
```typescript
// Create subscription for creator tier
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: TIER_PRICE_IDS[tierLevel] }],
  metadata: {
    userId: user.id,
    tier: tierLevel
  }
});

// Handle subscription updates
await stripe.subscriptions.update(subscription.id, {
  items: [{
    id: subscription.items.data[0].id,
    price: NEW_PRICE_ID
  }],
  proration_behavior: 'create_prorations'
});
```

### Billing Management
```typescript
// Create customer portal session
const session = await stripe.billingPortal.sessions.create({
  customer: customer.id,
  return_url: `${baseUrl}/dashboard/billing`
});

// Redirect user to portal
response.redirect(session.url);
```

## Webhook Handling

### Payment Events
```typescript
// Handle webhook events
export default async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;
        
      case 'account.updated':
        await handleAccountUpdate(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
```

### Event Processors
```typescript
async function handlePaymentSuccess(paymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;
  
  await updateBooking(bookingId, {
    paymentStatus: 'captured',
    paymentIntentId: paymentIntent.id,
    paidAt: new Date()
  });
  
  // Send confirmation emails
  await sendPaymentConfirmation(bookingId);
}

async function handleTransferCreated(transfer) {
  const bookingId = transfer.metadata.bookingId;
  
  await recordTransfer(bookingId, {
    transferId: transfer.id,
    amount: transfer.amount / 100,
    destination: transfer.destination,
    status: 'pending'
  });
}
```

## Refund Processing

### Automatic Refunds
```typescript
async function processRefund(bookingId: string, reason: string) {
  const booking = await getBooking(bookingId);
  
  // Calculate refund amount
  const refundAmount = calculateRefundAmount(booking, reason);
  
  // Create refund
  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentIntentId,
    amount: refundAmount * 100,
    reason: 'requested_by_customer',
    metadata: {
      bookingId,
      refundReason: reason
    }
  });
  
  // Update booking
  await updateBooking(bookingId, {
    status: 'refunded',
    refundId: refund.id,
    refundAmount,
    refundedAt: new Date()
  });
  
  return refund;
}
```

### Dispute Handling
```typescript
async function handleDispute(bookingId: string, disputeData: any) {
  // Gather evidence
  const evidence = await gatherDisputeEvidence(bookingId);
  
  // Submit to Stripe
  await stripe.disputes.update(disputeData.id, {
    evidence: {
      customer_communication: evidence.messages,
      service_documentation: evidence.deliverables,
      shipping_documentation: evidence.timeline
    }
  });
  
  // Update booking status
  await updateBooking(bookingId, {
    status: 'disputed',
    disputeId: disputeData.id
  });
}
```

## Platform Fees

### Fee Structure
```typescript
const PLATFORM_FEES = {
  standard: 0.05, // 5%
  verified: 0.04, // 4%
  signature: 0.03, // 3%
  enterprise: 0.02 // 2%
};

function calculatePlatformFee(amount: number, userTier: string): number {
  const feeRate = PLATFORM_FEES[userTier] || PLATFORM_FEES.standard;
  return amount * feeRate;
}
```

### Fee Collection
```typescript
// Collect platform fee on transfer
const transfer = await stripe.transfers.create({
  amount: (totalAmount - platformFee) * 100,
  currency: 'usd',
  destination: providerAccountId,
  metadata: {
    bookingId,
    platformFee: platformFee * 100
  }
});

// Platform fee is automatically retained
```

## Security & Compliance

### PCI Compliance
- All payment data handled by Stripe
- No card details stored on platform
- Secure tokenization for saved payment methods

### Fraud Prevention
```typescript
// Enhanced fraud detection
const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency: 'usd',
  payment_method_types: ['card'],
  radar_options: {
    session: radarSessionId
  },
  metadata: {
    user_id: userId,
    booking_id: bookingId
  }
});
```

### Data Protection
- Encrypted payment metadata
- Audit logs for all transactions
- GDPR compliance for user data

## Monitoring & Analytics

### Key Metrics
- Payment success rates
- Average transaction value
- Platform fee revenue
- Dispute rates
- Refund rates

### Dashboard Integration
```typescript
// Payment analytics
const analytics = await getPaymentAnalytics({
  timeRange: 'last_30_days',
  groupBy: 'day',
  metrics: ['volume', 'fees', 'disputes']
});

// Provider earnings
const earnings = await getProviderEarnings(providerId, {
  timeRange: 'current_month',
  includeProjected: true
});
```

## Error Handling

### Payment Failures
```typescript
try {
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Show card-specific error to user
    return { error: error.message };
  } else {
    // Log other errors and show generic message
    console.error('Payment error:', error);
    return { error: 'Payment processing failed. Please try again.' };
  }
}
```

### Webhook Reliability
```typescript
// Implement idempotency for webhook processing
async function processWebhookEvent(event) {
  const processedEvent = await getProcessedEvent(event.id);
  
  if (processedEvent) {
    return { status: 'already_processed' };
  }
  
  // Process event
  await handleEvent(event);
  
  // Mark as processed
  await markEventProcessed(event.id);
}
```
