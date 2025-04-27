import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export async function POST(req: NextRequest) {
  const { serviceId, buyerId, amount } = await req.json();

  if (!serviceId || !buyerId || !amount) {
    return new NextResponse('Missing checkout parameters.', { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Service ID: ${serviceId}`,
          },
          unit_amount: Math.round(amount * 100), // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      serviceId,
      buyerId,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/purchases?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${serviceId}?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
