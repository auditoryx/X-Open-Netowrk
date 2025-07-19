# 📅 AuditoryX Booking Flow

## Overview

The AuditoryX booking system provides a comprehensive workflow for creator-client collaborations, from discovery to completion. The system handles single and multi-creator projects with built-in payment protection, communication tools, and dispute resolution.

## 🔄 Booking Lifecycle States

### State Diagram
```
    [Browse] → [Request] → [Pending] → [Confirmed] → [In Progress] → [Completed] → [Reviewed]
                    ↓           ↓            ↓              ↓
                [Cancelled] [Cancelled] [Cancelled]    [Disputed]
                                                          ↓
                                                    [Resolved/Escalated]
```

## 📝 Detailed Booking Flow

### 1. Discovery & Browsing
**User Action**: Client browses creator profiles and services

**Available Features**:
- 🔍 Advanced search with filters (genre, location, tier, price)
- 📊 Creator analytics and portfolio review
- ⭐ Review and rating system
- 💬 Initial inquiry messages
- 📅 Availability calendar viewing

**System Behavior**:
- Track user browsing patterns for recommendations
- Display real-time availability status
- Show tier-based trust signals (badges)
- Filter results based on user tier permissions

---

### 2. Booking Request (`pending`)
**User Action**: Client initiates a booking request

**Required Information**:
```typescript
interface BookingRequest {
  creatorId: string;
  serviceType: string;
  projectDescription: string;
  budget: {
    amount: number;
    currency: string;
    paymentType: 'hourly' | 'fixed' | 'milestone';
  };
  timeline: {
    startDate: Date;
    deadline: Date;
    estimatedHours?: number;
  };
  deliverables: string[];
  additionalRequirements?: string;
  collaborators?: string[]; // For split bookings
}
```

**System Actions**:
- Generate unique booking ID
- Send notification to creator
- Create initial chat room
- Place temporary hold on payment method
- Set 48-hour response deadline for creator

**Status**: `pending`

---

### 3. Creator Response
**Creator Options**:
- ✅ **Accept**: Move to `confirmed` status
- ❌ **Decline**: Move to `cancelled` status
- 💬 **Counter-offer**: Negotiate terms in chat
- 📋 **Request clarification**: Ask for more details

**System Behavior**:
```typescript
// Auto-decline if no response within 48 hours
setTimeout(() => {
  if (booking.status === 'pending') {
    updateBookingStatus(bookingId, 'cancelled', 'creator_timeout');
    releasePaymentHold(booking.paymentIntentId);
    notifyClient(booking.clientId, 'booking_auto_cancelled');
  }
}, 48 * 60 * 60 * 1000); // 48 hours
```

---

### 4. Confirmation (`confirmed`)
**Triggered When**: Creator accepts the booking request

**System Actions**:
1. **Contract Generation**: Auto-generate service contract
2. **Payment Processing**: Charge client and place in escrow
3. **Calendar Booking**: Block creator's calendar for project duration
4. **Notification**: Confirm booking to both parties
5. **Split Payment Setup**: If multiple creators, configure revenue distribution

**Contract Details**:
```typescript
interface ServiceContract {
  bookingId: string;
  parties: {
    client: UserProfile;
    creators: UserProfile[];
  };
  serviceDetails: {
    description: string;
    deliverables: string[];
    timeline: Timeline;
    milestones?: Milestone[];
  };
  payment: {
    totalAmount: number;
    platformFee: number;
    creatorPayouts: PayoutDetail[];
    escrowReleaseConditions: string[];
  };
  signatures: {
    clientSignedAt?: Date;
    creatorSignedAt?: Date;
  };
  terms: ContractTerms;
}
```

**Status**: `confirmed`

---

### 5. Project Execution (`in_progress`)
**Triggered When**: Creator marks project as started

**Available Tools**:
- 💬 **Real-time Chat**: Project communication hub
- 📁 **File Sharing**: Secure file uploads and downloads
- 🎯 **Milestone Tracking**: Progress updates and approvals
- 📅 **Calendar Integration**: Schedule updates and meetings
- 📊 **Time Tracking**: For hourly projects
- 🔄 **Revision Requests**: Structured feedback system

**Communication Features**:
```typescript
interface ProjectChat {
  bookingId: string;
  participants: string[];
  messages: Message[];
  fileAttachments: FileAttachment[];
  milestoneUpdates: MilestoneUpdate[];
  systemNotifications: SystemNotification[];
}
```

**Progress Tracking**:
- Creator submits progress updates
- Client can request revisions
- Automated deadline reminders
- Milestone payment releases (for milestone projects)

**Status**: `in_progress`

---

### 6. Delivery & Completion (`completed`)
**Completion Triggers**:
1. Creator marks deliverables as complete
2. Client approves final delivery
3. Both parties confirm satisfaction

**Final Delivery Process**:
```typescript
interface FinalDelivery {
  deliverables: {
    files: FileAttachment[];
    description: string;
    completionNotes: string;
  };
  creatorConfirmation: {
    confirmedAt: Date;
    finalInvoice?: Invoice;
  };
  clientApproval: {
    approvedAt?: Date;
    feedback?: string;
    requestRevisions?: RevisionRequest;
  };
}
```

**Payment Release**:
- Automatic release after 7 days (Standard tier)
- Automatic release after 3 days (Verified tier)
- Immediate release (Signature tier)
- Manual release upon client approval

**Status**: `completed`

---

### 7. Review & Rating (`reviewed`)
**Review Period**: 14 days after completion

**Review Components**:
```typescript
interface ProjectReview {
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: {
    overall: number;        // 1-5 stars
    communication: number;  // 1-5 stars
    quality: number;       // 1-5 stars
    timeliness: number;    // 1-5 stars
    professionalism: number; // 1-5 stars
  };
  writtenReview: string;
  wouldRecommend: boolean;
  isPublic: boolean;
  reviewTags?: string[];
}
```

**System Impact**:
- Update user reputation scores
- Influence search ranking algorithms
- Generate trust score adjustments
- Provide data for matching improvements

**Status**: `reviewed`

---

## 🚫 Cancellation & Disputes

### Cancellation Policies

#### Client Cancellation
- **Before Confirmation**: Full refund, no fees
- **After Confirmation, Before Start**: 
  - Within 24 hours: 90% refund
  - 24-48 hours: 75% refund
  - After 48 hours: 50% refund
- **After Project Start**: Negotiated refund based on work completed

#### Creator Cancellation
- **Emergency Cancellation**: Full client refund, creator penalty
- **Voluntary Cancellation**: Full client refund, reputation impact
- **Force Majeure**: Case-by-case resolution

### Dispute Resolution Process

#### Automatic Dispute Triggers
```typescript
const DISPUTE_TRIGGERS = {
  DEADLINE_EXCEEDED: 'Project deadline exceeded by 48+ hours',
  NO_COMMUNICATION: 'No response for 72+ hours during active project',
  QUALITY_REJECTION: 'Multiple revision rejections',
  PAYMENT_DISPUTE: 'Disagreement on payment terms',
  SCOPE_CREEP: 'Work requests beyond original scope'
};
```

#### Resolution Steps
1. **Automated Mediation**: AI-powered conflict detection and suggestions
2. **Platform Mediation**: Human mediator reviews case and evidence
3. **Arbitration**: Final decision by senior platform team
4. **Legal Escalation**: External legal resolution for high-value disputes

#### Evidence Collection
- Complete chat history
- File exchange records
- Timeline of all actions
- Contract terms and modifications
- Payment transaction history

---

## 🔗 Integration Points

### Chat System
- Real-time messaging with typing indicators
- File sharing with virus scanning
- Message translation for international collaborations
- Voice/video call integration
- Automated booking status updates

### Calendar Integration
```typescript
interface CalendarIntegration {
  googleCalendar?: {
    enabled: boolean;
    calendarId: string;
    syncBookings: boolean;
  };
  outlookCalendar?: {
    enabled: boolean;
    calendarId: string;
    syncBookings: boolean;
  };
  availability: {
    timezone: string;
    workingHours: TimeSlot[];
    blockedDates: Date[];
  };
}
```

### Stripe Payment Flow
1. **Payment Intent Creation**: Secure payment setup
2. **Escrow Holding**: Funds held until completion
3. **Split Payments**: Automatic distribution to collaborators
4. **Fee Calculation**: Platform fees based on user tier
5. **Payout Processing**: Scheduled payouts to creator accounts

### Contract System
- PDF generation with legal terms
- Digital signature collection
- Contract modification tracking
- Legal compliance validation
- Dispute evidence preservation

---

## 📊 Booking Analytics

### Performance Metrics
- Booking conversion rates by tier
- Average project completion time
- Client satisfaction scores
- Creator utilization rates
- Revenue per booking
- Dispute resolution success rates

### User Insights
- Booking patterns and preferences
- Seasonal demand fluctuations
- Geographic booking distribution
- Service category performance
- Price point optimization

---

## 🔧 Technical Implementation

### Database Schema
```typescript
interface Booking {
  id: string;
  status: BookingStatus;
  clientId: string;
  creatorIds: string[];
  serviceDetails: ServiceDetails;
  payment: PaymentDetails;
  timeline: Timeline;
  chatRoomId: string;
  contractId: string;
  metadata: BookingMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Management
```typescript
export class BookingStateMachine {
  async transitionTo(bookingId: string, newStatus: BookingStatus, metadata?: any) {
    const booking = await this.getBooking(bookingId);
    
    if (!this.isValidTransition(booking.status, newStatus)) {
      throw new Error(`Invalid transition from ${booking.status} to ${newStatus}`);
    }
    
    return await this.updateBookingStatus(bookingId, newStatus, metadata);
  }
  
  private isValidTransition(current: BookingStatus, next: BookingStatus): boolean {
    const validTransitions = BOOKING_STATE_TRANSITIONS[current] || [];
    return validTransitions.includes(next);
  }
}
```

---

**Booking Flow Version**: 3.0  
**Last Updated**: January 2025  
**Compatible With**: AuditoryX Platform v2.0+