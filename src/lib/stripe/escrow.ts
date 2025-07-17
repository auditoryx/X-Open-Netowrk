import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface EscrowPayment {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'released' | 'refunded';
  paymentIntentId: string;
  providerAmount: number;
  platformFee: number;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

export class EscrowService {
  async createEscrowPayment(
    bookingId: string,
    providerId: string,
    customerId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // Get provider's Stripe Connect account
      const providerDoc = await adminDb.doc(`users/${providerId}`).get();
      const providerData = providerDoc.data();
      
      if (!providerData?.stripeConnectId) {
        throw new Error('Provider does not have a Stripe Connect account');
      }

      // Calculate platform fee (20%) and provider amount (80%)
      const platformFee = Math.round(amount * 0.2 * 100); // 20% in cents
      const providerAmount = Math.round(amount * 0.8 * 100); // 80% in cents
      const totalAmount = amount * 100; // Total in cents

      // Create payment intent with application fee
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency,
        application_fee_amount: platformFee,
        transfer_data: {
          destination: providerData.stripeConnectId,
        },
        transfer_group: bookingId,
        metadata: {
          bookingId,
          providerId,
          customerId,
          type: 'escrow_payment',
          platformFee: platformFee.toString(),
          providerAmount: providerAmount.toString()
        },
        capture_method: 'automatic',
        confirmation_method: 'automatic'
      });

      // Store escrow record
      const escrowData: EscrowPayment = {
        id: paymentIntent.id,
        bookingId,
        providerId,
        customerId,
        amount,
        currency,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        providerAmount: providerAmount / 100,
        platformFee: platformFee / 100,
        createdAt: new Date().toISOString()
      };

      await adminDb.collection('escrows').doc(bookingId).set(escrowData);

      // Log escrow creation
      await adminDb.collection('escrow_logs').add({
        escrowId: paymentIntent.id,
        bookingId,
        providerId,
        customerId,
        action: 'escrow_created',
        amount,
        timestamp: new Date().toISOString()
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Failed to create escrow payment:', error);
      throw error;
    }
  }

  async holdEscrowPayment(bookingId: string): Promise<void> {
    try {
      const escrowDoc = await adminDb.doc(`escrows/${bookingId}`).get();
      const escrow = escrowDoc.data() as EscrowPayment;

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'pending') {
        throw new Error(`Cannot hold escrow with status: ${escrow.status}`);
      }

      // Update payment intent to capture funds
      await stripe.paymentIntents.capture(escrow.paymentIntentId);

      // Update escrow status
      await adminDb.doc(`escrows/${bookingId}`).update({
        status: 'held',
        heldAt: new Date().toISOString()
      });

      // Log escrow hold
      await adminDb.collection('escrow_logs').add({
        escrowId: escrow.id,
        bookingId,
        providerId: escrow.providerId,
        customerId: escrow.customerId,
        action: 'escrow_held',
        amount: escrow.amount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to hold escrow payment:', error);
      throw error;
    }
  }

  async releaseEscrowPayment(bookingId: string): Promise<void> {
    try {
      const escrowDoc = await adminDb.doc(`escrows/${bookingId}`).get();
      const escrow = escrowDoc.data() as EscrowPayment;

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'held') {
        throw new Error(`Cannot release escrow with status: ${escrow.status}`);
      }

      // Get provider's Stripe Connect account
      const providerDoc = await adminDb.doc(`users/${escrow.providerId}`).get();
      const providerData = providerDoc.data();

      if (!providerData?.stripeConnectId) {
        throw new Error('Provider does not have a Stripe Connect account');
      }

      // The transfer happens automatically when payment is captured
      // due to the transfer_data in the original payment intent
      // We just need to update the escrow status

      // Update escrow status
      await adminDb.doc(`escrows/${bookingId}`).update({
        status: 'released',
        releasedAt: new Date().toISOString()
      });

      // Update booking status
      await adminDb.doc(`bookings/${bookingId}`).update({
        paymentStatus: 'completed',
        completedAt: new Date().toISOString()
      });

      // Log escrow release
      await adminDb.collection('escrow_logs').add({
        escrowId: escrow.id,
        bookingId,
        providerId: escrow.providerId,
        customerId: escrow.customerId,
        action: 'escrow_released',
        amount: escrow.amount,
        timestamp: new Date().toISOString()
      });

      // Send notifications
      await this.sendReleaseNotifications(bookingId, escrow);
    } catch (error) {
      console.error('Failed to release escrow payment:', error);
      throw error;
    }
  }

  async refundEscrowPayment(bookingId: string, reason?: string): Promise<void> {
    try {
      const escrowDoc = await adminDb.doc(`escrows/${bookingId}`).get();
      const escrow = escrowDoc.data() as EscrowPayment;

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status === 'refunded') {
        throw new Error('Escrow already refunded');
      }

      // Create refund
      const refund = await stripe.refunds.create({
        payment_intent: escrow.paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          bookingId,
          reason: reason || 'Booking cancelled'
        }
      });

      // Update escrow status
      await adminDb.doc(`escrows/${bookingId}`).update({
        status: 'refunded',
        refundedAt: new Date().toISOString(),
        refundId: refund.id,
        refundReason: reason
      });

      // Update booking status
      await adminDb.doc(`bookings/${bookingId}`).update({
        paymentStatus: 'refunded',
        refundedAt: new Date().toISOString(),
        refundReason: reason
      });

      // Log escrow refund
      await adminDb.collection('escrow_logs').add({
        escrowId: escrow.id,
        bookingId,
        providerId: escrow.providerId,
        customerId: escrow.customerId,
        action: 'escrow_refunded',
        amount: escrow.amount,
        refundId: refund.id,
        reason,
        timestamp: new Date().toISOString()
      });

      // Send notifications
      await this.sendRefundNotifications(bookingId, escrow, reason);
    } catch (error) {
      console.error('Failed to refund escrow payment:', error);
      throw error;
    }
  }

  async getEscrowStatus(bookingId: string): Promise<EscrowPayment | null> {
    try {
      const escrowDoc = await adminDb.doc(`escrows/${bookingId}`).get();
      return escrowDoc.exists ? escrowDoc.data() as EscrowPayment : null;
    } catch (error) {
      console.error('Failed to get escrow status:', error);
      return null;
    }
  }

  async getEscrowsByProvider(providerId: string): Promise<EscrowPayment[]> {
    try {
      const escrowsSnapshot = await adminDb.collection('escrows')
        .where('providerId', '==', providerId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      return escrowsSnapshot.docs.map(doc => doc.data() as EscrowPayment);
    } catch (error) {
      console.error('Failed to get escrows by provider:', error);
      return [];
    }
  }

  async getEscrowsByCustomer(customerId: string): Promise<EscrowPayment[]> {
    try {
      const escrowsSnapshot = await adminDb.collection('escrows')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      return escrowsSnapshot.docs.map(doc => doc.data() as EscrowPayment);
    } catch (error) {
      console.error('Failed to get escrows by customer:', error);
      return [];
    }
  }

  private async sendReleaseNotifications(bookingId: string, escrow: EscrowPayment): Promise<void> {
    try {
      // Get booking details
      const bookingDoc = await adminDb.doc(`bookings/${bookingId}`).get();
      const booking = bookingDoc.data();

      if (!booking) return;

      // Send notification to provider
      await adminDb.collection('notifications').add({
        userId: escrow.providerId,
        type: 'payment_released',
        title: 'Payment Released',
        message: `Your payment of $${escrow.providerAmount} has been released for booking ${bookingId}`,
        data: {
          bookingId,
          amount: escrow.providerAmount,
          type: 'payment_released'
        },
        createdAt: new Date().toISOString(),
        read: false
      });

      // Send notification to customer
      await adminDb.collection('notifications').add({
        userId: escrow.customerId,
        type: 'payment_completed',
        title: 'Payment Completed',
        message: `Your payment for booking ${bookingId} has been processed successfully`,
        data: {
          bookingId,
          amount: escrow.amount,
          type: 'payment_completed'
        },
        createdAt: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Failed to send release notifications:', error);
    }
  }

  private async sendRefundNotifications(bookingId: string, escrow: EscrowPayment, reason?: string): Promise<void> {
    try {
      // Send notification to customer
      await adminDb.collection('notifications').add({
        userId: escrow.customerId,
        type: 'payment_refunded',
        title: 'Payment Refunded',
        message: `Your payment of $${escrow.amount} has been refunded for booking ${bookingId}`,
        data: {
          bookingId,
          amount: escrow.amount,
          reason,
          type: 'payment_refunded'
        },
        createdAt: new Date().toISOString(),
        read: false
      });

      // Send notification to provider
      await adminDb.collection('notifications').add({
        userId: escrow.providerId,
        type: 'booking_refunded',
        title: 'Booking Refunded',
        message: `Booking ${bookingId} has been refunded${reason ? `: ${reason}` : ''}`,
        data: {
          bookingId,
          amount: escrow.amount,
          reason,
          type: 'booking_refunded'
        },
        createdAt: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Failed to send refund notifications:', error);
    }
  }
}