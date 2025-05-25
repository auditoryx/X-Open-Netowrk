import { stripe } from '@/lib/stripe';
import { sendInAppNotification } from "@/lib/notifications/sendInAppNotification";
import { admin } from '@/lib/firebase-admin';
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    console.error('❌ Stripe webhook signature verification failed:', err);
    await firestore.collection("stripe_logs").add({
      type: "webhook_signature_error",
      error: err?.message || "Invalid signature",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    const bookingId = metadata.bookingId;
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

        console.log('✅ Booking confirmed:', metadata.bookingId);
      }
    } catch (err: any) {
      console.error('🔥 Failed to handle Stripe event:', err.message);
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
// Note: This webhook handler is not secured with authentication. Ensure to validate the event source and payload in production.
// This is a simplified example. In a real-world application, you should implement proper error handling and logging.
// Also, consider using a library like `stripe-webhook` for easier handling of Stripe webhooks.
// This code is a basic example of how to handle Stripe webhooks in a Next.js API route.
// It listens for the `checkout.session.completed` event, verifies the signature, and processes the event accordingly.
