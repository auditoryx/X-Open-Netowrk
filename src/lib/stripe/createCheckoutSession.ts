import axios from 'axios'

export async function createCheckoutSession({ bookingId, price }: { bookingId: string; price: number }) {
  const { data } = await axios.post('/api/create-checkout-session', {
    bookingId,
    price,
  })
  return data
}
