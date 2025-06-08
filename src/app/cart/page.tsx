'use client'

import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, clear } = useCart()

  const subtotal = items.reduce((s, i) => s + i.price, 0)
  const fee = Math.round(subtotal * 0.1)
  const total = subtotal + fee

  const checkout = async () => {
    const res = await fetch('/api/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (items.length === 0) return <div className="p-6 text-white">Cart is empty.</div>

  return (
    <div className="min-h-screen p-6 text-white bg-black">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <ul className="space-y-2 mb-4">
        {items.map((item) => (
          <li key={item.serviceId} className="border p-2 rounded">
            {item.serviceName} - ${item.price}
          </li>
        ))}
      </ul>
      <p>Subtotal: ${subtotal}</p>
      <p>Fees: ${fee}</p>
      <p className="font-semibold">Total: ${total}</p>
      <button onClick={checkout} className="btn mt-4">Checkout</button>
      <button onClick={clear} className="btn ml-2 mt-4">Clear</button>
    </div>
  )
}
