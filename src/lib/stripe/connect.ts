import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface ConnectAccount {
  id: string;
  email: string;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

export class StripeConnectService {
  async createConnectAccount(userId: string, email: string): Promise<string> {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          userId,
          platform: 'auditoryx'
        }
      });

      // Store account ID in user profile
      await adminDb.doc(`users/${userId}`).update({
        stripeConnectId: account.id,
        stripeConnectStatus: 'pending',
        stripeConnectCreatedAt: new Date().toISOString()
      });

      // Log account creation
      await adminDb.collection('stripe_connect_logs').add({
        userId,
        accountId: account.id,
        action: 'account_created',
        timestamp: new Date().toISOString()
      });

      return account.id;
    } catch (error) {
      console.error('Failed to create Stripe Connect account:', error);
      throw error;
    }
  }

  async createAccountLink(accountId: string, userId: string): Promise<string> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/setup?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/success`,
        type: 'account_onboarding',
      });

      // Log account link creation
      await adminDb.collection('stripe_connect_logs').add({
        userId,
        accountId,
        action: 'account_link_created',
        timestamp: new Date().toISOString()
      });

      return accountLink.url;
    } catch (error) {
      console.error('Failed to create account link:', error);
      throw error;
    }
  }

  async getAccountStatus(accountId: string): Promise<ConnectAccount> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      
      return {
        id: account.id,
        email: account.email || '',
        details_submitted: account.details_submitted || false,
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        requirements: account.requirements ? {
          currently_due: account.requirements.currently_due || [],
          eventually_due: account.requirements.eventually_due || [],
          past_due: account.requirements.past_due || []
        } : undefined
      };
    } catch (error) {
      console.error('Failed to get account status:', error);
      throw error;
    }
  }

  async updateAccountStatus(userId: string, accountId: string): Promise<void> {
    try {
      const accountStatus = await this.getAccountStatus(accountId);
      
      let status = 'pending';
      if (accountStatus.charges_enabled && accountStatus.payouts_enabled) {
        status = 'active';
      } else if (accountStatus.details_submitted) {
        status = 'submitted';
      }

      await adminDb.doc(`users/${userId}`).update({
        stripeConnectStatus: status,
        stripeConnectUpdatedAt: new Date().toISOString(),
        stripeConnectDetails: {
          charges_enabled: accountStatus.charges_enabled,
          payouts_enabled: accountStatus.payouts_enabled,
          details_submitted: accountStatus.details_submitted,
          requirements: accountStatus.requirements
        }
      });

      // Log status update
      await adminDb.collection('stripe_connect_logs').add({
        userId,
        accountId,
        action: 'status_updated',
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update account status:', error);
      throw error;
    }
  }

  async createLoginLink(accountId: string): Promise<string> {
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return loginLink.url;
    } catch (error) {
      console.error('Failed to create login link:', error);
      throw error;
    }
  }

  async deleteAccount(accountId: string, userId: string): Promise<void> {
    try {
      await stripe.accounts.del(accountId);
      
      // Update user profile
      await adminDb.doc(`users/${userId}`).update({
        stripeConnectId: null,
        stripeConnectStatus: null,
        stripeConnectDeletedAt: new Date().toISOString()
      });

      // Log account deletion
      await adminDb.collection('stripe_connect_logs').add({
        userId,
        accountId,
        action: 'account_deleted',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  async getAccountBalance(accountId: string): Promise<{available: number, pending: number}> {
    try {
      const balance = await stripe.balance.retrieve({ stripeAccount: accountId });
      
      const available = balance.available.reduce((total, item) => total + item.amount, 0);
      const pending = balance.pending.reduce((total, item) => total + item.amount, 0);
      
      return {
        available: available / 100, // Convert from cents to dollars
        pending: pending / 100
      };
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return { available: 0, pending: 0 };
    }
  }

  async getAccountPayouts(accountId: string, limit: number = 10): Promise<any[]> {
    try {
      const payouts = await stripe.payouts.list(
        { limit },
        { stripeAccount: accountId }
      );
      
      return payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrival_date: payout.arrival_date,
        created: payout.created,
        description: payout.description,
        method: payout.method,
        type: payout.type
      }));
    } catch (error) {
      console.error('Failed to get account payouts:', error);
      return [];
    }
  }
}