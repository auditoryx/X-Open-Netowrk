import { stripe } from '@/lib/stripe';
import { sendInAppNotification } from "@/lib/notifications/sendInAppNotification";
import { admin } from '@/lib/firebase-admin';
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@lib/logger';
import { Sentry } from '@lib/sentry';
import { EscrowService } from '@/lib/stripe/escrow';
import { StripeConnectService } from '@/lib/stripe/connect';

export async function POST(req: Request) {
  const buf = await req.arrayBuffer();
  const payload = Buffer.from(buf).toString();
  const sig = req.headers.get('stripe-signature')!;
  const firestore = admin.firestore();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error('❌ Stripe webhook signature verification failed:', err);
    Sentry.captureException(err);
    await firestore.collection("stripe_logs").add({
      type: "webhook_signature_error",
      error: err?.message || "Invalid signature",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle escrow payment events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    if (paymentIntent.metadata.type === 'escrow_payment') {
      await handleEscrowPaymentSuccess(paymentIntent);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    if (paymentIntent.metadata.type === 'escrow_payment') {
      await handleEscrowPaymentFailed(paymentIntent);
    }
  }

  // Handle Stripe Connect account events
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    await handleConnectAccountUpdated(account);
  }

  // Handle transfer events
  if (event.type === 'transfer.created') {
    const transfer = event.data.object as Stripe.Transfer;
    await handleTransferCreated(transfer);
  }

  if (event.type === 'payout.paid') {
    const payout = event.data.object as Stripe.Payout;
    await handlePayoutPaid(payout);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    const bookingId = metadata.bookingId as string | undefined;
    const groupId = metadata.groupBookingId as string | undefined;
    if (groupId) {
      const groupRef = firestore.collection('groupBookings').doc(groupId);
      const groupSnap = await groupRef.get();
      const group = groupSnap.data() as any;
      if (group) {
        const services = (group.services || []) as any[];
        for (const svc of services) {
          await firestore.collection('bookings').add({
            ...svc,
            groupBookingId: groupId,
            buyerId: group.userId,
            status: 'paid',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        await groupRef.update({ status: 'paid' });
      }
    }

    if (bookingId) {
      const bookingRef = firestore.collection("bookings").doc(bookingId);
      await bookingRef.update({ status: "paid" });
      const bookingSnap = await bookingRef.get();
      const booking = bookingSnap.data();
      if (booking) {
        await sendInAppNotification({
          to: booking.buyerId,
          type: "booking",
          title: "Booking Confirmed",
          message: "Your payment was successful. You can now chat with your provider.",
          link: `/dashboard/bookings/${bookingId}`
        });
        await sendInAppNotification({
          to: booking.providerId,
          type: "booking",
          title: "New Paid Booking",
          message: "Someone just booked your service. Time to deliver!",
          link: `/dashboard/bookings/${bookingId}`
        });
      }
    }
    const mode = session.mode;
    const email = session.customer_email || 'unknown@email.com';

    try {
      if (mode === 'subscription' && metadata.uid) {
        await firestore.collection('users').doc(metadata.uid).update({
          subscriptionStatus: 'pro',
        });

        await logActivity(metadata.uid, 'subscription_activated', {
          email,
        });
      }

      if (mode === 'payment' && metadata.bookingId) {
        await firestore.collection('bookings').doc(metadata.bookingId).update({
          paid: true,
          status: 'confirmed',
        });

        await sendBookingConfirmation(email, metadata.bookingId);
        await logActivity(email, 'booking_paid', {
          bookingId: metadata.bookingId,
        });

        logger.info('✅ Booking confirmed:', metadata.bookingId);
      }
    } catch (err: any) {
      logger.error('🔥 Failed to handle Stripe event:', err.message);
      Sentry.captureException(err);
      await firestore.collection('errorLogs').add({
        type: 'webhook_handling_error',
        message: err.message,
        eventType: event.type,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

// Handle escrow payment success
async function handleEscrowPaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId;
    
    if (!bookingId) return;
    
    const firestore = admin.firestore();
    
    // Update escrow status
    await firestore.collection('escrows').doc(bookingId).update({
      status: 'held',
      heldAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentIntentId: paymentIntent.id
    });
    
    // Update booking status
    await firestore.collection('bookings').doc(bookingId).update({
      paymentStatus: 'paid',
      paidAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('✅ Escrow payment succeeded:', bookingId);
    
    // Send notifications
    const providerId = paymentIntent.metadata.providerId;
    const customerId = paymentIntent.metadata.customerId;
    
    if (providerId) {
      await sendInAppNotification({
        to: providerId,
        type: "booking",
        title: "Payment Received",
        message: "Payment has been received and is held in escrow until service completion.",
        link: `/dashboard/bookings/${bookingId}`
      });
    }
    
    if (customerId) {
      await sendInAppNotification({
        to: customerId,
        type: "booking",
        title: "Payment Confirmed",
        message: "Your payment has been confirmed. The provider will be notified.",
        link: `/dashboard/bookings/${bookingId}`
      });
    }
    
  } catch (error) {
    logger.error('Failed to handle escrow payment success:', error);
    Sentry.captureException(error);
  }
}

// Handle escrow payment failure
async function handleEscrowPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId;
    
    if (!bookingId) return;
    
    const firestore = admin.firestore();
    
    // Update escrow status
    await firestore.collection('escrows').doc(bookingId).update({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
    });
    
    // Update booking status
    await firestore.collection('bookings').doc(bookingId).update({
      paymentStatus: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.error('❌ Escrow payment failed:', bookingId);
    
    // Send notification to customer
    const customerId = paymentIntent.metadata.customerId;
    if (customerId) {
      await sendInAppNotification({
        to: customerId,
        type: "booking",
        title: "Payment Failed",
        message: "Your payment could not be processed. Please try again or contact support.",
        link: `/dashboard/bookings/${bookingId}`
      });
    }
    
  } catch (error) {
    logger.error('Failed to handle escrow payment failure:', error);
    Sentry.captureException(error);
  }
}

// Handle Connect account updates
async function handleConnectAccountUpdated(account: Stripe.Account) {
  try {
    const firestore = admin.firestore();
    
    // Find user by Stripe Connect ID
    const usersSnapshot = await firestore.collection('users')
      .where('stripeConnectId', '==', account.id)
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const connectService = new StripeConnectService();
      
      await connectService.updateAccountStatus(userDoc.id, account.id);
      
      logger.info('✅ Connect account updated:', account.id);
    }
    
  } catch (error) {
    logger.error('Failed to handle Connect account update:', error);
    Sentry.captureException(error);
  }
}

// Handle transfer creation
async function handleTransferCreated(transfer: Stripe.Transfer) {
  try {
    const firestore = admin.firestore();
    
    // Log transfer for audit purposes
    await firestore.collection('transfer_logs').add({
      transferId: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency,
      destination: transfer.destination,
      transferGroup: transfer.transfer_group,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('✅ Transfer created:', transfer.id);
    
  } catch (error) {
    logger.error('Failed to handle transfer creation:', error);
    Sentry.captureException(error);
  }
}

// Handle payout completion
async function handlePayoutPaid(payout: Stripe.Payout) {
  try {
    const firestore = admin.firestore();
    
    // Log payout for audit purposes
    await firestore.collection('payout_logs').add({
      payoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: payout.status,
      arrivalDate: new Date(payout.arrival_date * 1000).toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('✅ Payout completed:', payout.id);
    
  } catch (error) {
    logger.error('Failed to handle payout completion:', error);
    Sentry.captureException(error);
  }
}

// Note: This webhook handler is not secured with authentication. Ensure to validate the event source and payload in production.
// This is a simplified example. In a real-world application, you should implement proper error handling and logging.
// Also, consider using a library like `stripe-webhook` for easier handling of Stripe webhooks.
// This code is a basic example of how to handle Stripe webhooks in a Next.js API route.
// It listens for the `checkout.session.completed` event, verifies the signature, and processes the event accordingly.
