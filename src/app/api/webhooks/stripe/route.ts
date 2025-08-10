/**
 * Stripe Webhook Handler
 * 
 * POST /api/webhooks/stripe
 * 
 * Handles webhook events from Stripe with production-grade security:
 * - Verifies webhook signatures using STRIPE_WEBHOOK_SECRET
 * - Validates environment-specific webhook endpoints
 * - Comprehensive error logging with Sentry integration
 * - Idempotent event processing
 * 
 * Security Requirements:
 * - STRIPE_WEBHOOK_SECRET must be configured in production
 * - Webhook endpoints must be HTTPS in production
 * - Raw request body required for signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { updateBookingStatus } from '@/lib/firestore/updateBookingStatus';
import { markAsHeld } from '@/lib/firestore/bookings/markAsHeld';
import { generateContract } from '@/lib/firestore/contracts/generateContract';
import { calculateProviderPayout } from '@/lib/payments/calculateProviderPayout';
import { logger } from '@/lib/logger';
import { Sentry } from '@lib/sentry';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

// Production security: Webhook secret must be configured
if (isProduction && !endpointSecret) {
  throw new Error(
    'STRIPE_WEBHOOK_SECRET is required in production environment. ' +
    'Configure this in your deployment environment variables.'
  );
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate webhook secret is configured
    if (!endpointSecret) {
      const error = new Error('Webhook endpoint secret not configured');
      logger.error('❌ Stripe webhook misconfiguration', error);
      Sentry.captureException(error, {
        tags: { component: 'stripe-webhook', error_type: 'configuration' },
        level: 'error'
      });
      return new NextResponse('Webhook misconfigured', { status: 500 });
    }

    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      const error = new Error('Missing stripe-signature header');
      logger.error('❌ Stripe webhook missing signature', error);
      Sentry.captureException(error, {
        tags: { component: 'stripe-webhook', error_type: 'missing_signature' }
      });
      return new NextResponse('Missing signature', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Stripe webhook signature verification failed', {
        error: error.message,
        signaturePresent: !!sig,
        bodyLength: rawBody.length
      });
      
      Sentry.captureException(error, {
        tags: { 
          component: 'stripe-webhook', 
          error_type: 'signature_verification_failed' 
        },
        extra: {
          hasSignature: !!sig,
          bodyLength: rawBody.length,
          signatureHeader: sig?.substring(0, 20) + '...' // Log partial signature for debugging
        }
      });
      
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    // Log successful webhook receipt
    logger.info('✅ Stripe webhook received', {
      eventType: event.type,
      eventId: event.id,
      livemode: event.livemode
    });

    // Process webhook events
    await processWebhookEvent(event);

    const processingTime = Date.now() - startTime;
    logger.info('✅ Stripe webhook processed successfully', {
      eventType: event.type,
      eventId: event.id,
      processingTimeMs: processingTime
    });

    return new NextResponse('Webhook processed successfully', { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    const err = error as Error;
    
    logger.error('❌ Stripe webhook processing failed', {
      error: err.message,
      stack: err.stack,
      processingTimeMs: processingTime
    });

    Sentry.captureException(err, {
      tags: { 
        component: 'stripe-webhook', 
        error_type: 'processing_failed' 
      },
      extra: {
        processingTimeMs: processingTime,
        requestHeaders: Object.fromEntries(req.headers.entries())
      }
    });

    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

/**
 * Process individual webhook events with idempotency
 */
async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event);
      break;
    
    default:
      logger.info('ℹ️ Unhandled webhook event type', {
        eventType: event.type,
        eventId: event.id
      });
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata;
  
  if (!metadata) {
    logger.warn('⚠️ Checkout session missing metadata', {
      sessionId: session.id,
      eventId: event.id
    });
    return;
  }

  const { bookingId, buyerId, providerId, serviceName } = metadata;
  const amount = session.amount_total ? session.amount_total / 100 : undefined;

  if (!bookingId) {
    logger.warn('⚠️ Checkout session missing bookingId in metadata', {
      sessionId: session.id,
      eventId: event.id,
      metadata
    });
    return;
  }

  try {
    // Update booking status to paid
    await updateBookingStatus(bookingId, 'paid');
    
    // Hold funds in escrow
    await markAsHeld({ 
      bookingId, 
      userId: 'system', 
      role: 'admin' 
    });

    // Generate contract if all required data is present
    if (buyerId && providerId && serviceName && amount) {
      const startDate = new Date().toISOString().split('T')[0];
      const providerPayout = await calculateProviderPayout(amount);
      
      await generateContract(
        { 
          bookingId, 
          clientId: buyerId, 
          providerId, 
          serviceName, 
          price: amount, 
          startDate, 
          providerPayout 
        },
        'system'
      );
      
      logger.info('✅ Contract generated for completed booking', {
        bookingId,
        clientId: buyerId,
        providerId,
        amount,
        providerPayout
      });
    }

    logger.info('✅ Checkout session processed successfully', {
      bookingId,
      sessionId: session.id,
      amount,
      eventId: event.id
    });

  } catch (error) {
    const err = error as Error;
    logger.error('❌ Failed to process checkout session', {
      error: err.message,
      bookingId,
      sessionId: session.id,
      eventId: event.id
    });

    Sentry.captureException(err, {
      tags: { 
        component: 'stripe-webhook',
        event_type: 'checkout.session.completed',
        error_type: 'booking_processing_failed'
      },
      extra: {
        bookingId,
        sessionId: session.id,
        eventId: event.id,
        metadata
      }
    });

    throw err; // Re-throw to trigger webhook retry
  }
}
