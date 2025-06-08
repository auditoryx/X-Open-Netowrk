'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function FloatingCartButton() {
  const { items } = useCart()
  if (items.length === 0) return null

  return (
    <Link
      href="/cart"
      className="btn fixed bottom-4 right-4 z-50 px-4 py-2"
    >
      Cart ({items.length})
    </Link>
  )
}
