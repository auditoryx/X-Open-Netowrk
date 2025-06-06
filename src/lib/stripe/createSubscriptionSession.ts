import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getUserProfile } from '@lib/getUserProfile';

export async function createSubscriptionSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Not authenticated.');

  const userProfile = await getUserProfile(session.user.uid);
  if (!userProfile) throw new Error('No profile found.');

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer_email: session.user.email,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?canceled=true`,
    metadata: {
      uid: session.user.uid,
    },
  } as Stripe.Checkout.SessionCreateParams);

  return checkoutSession.url;
}
