import { stripe } from '@/lib/stripe'
import { CartItem } from '@/context/CartContext'

export async function createGroupBookingSession(groupBookingId: string, userId: string, items: CartItem[]) {
  const line_items = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.serviceName },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: 1,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    metadata: { groupBookingId, userId },
  })

  return session
}
