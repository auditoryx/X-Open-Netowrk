'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function BookingPage({ params }: { params: { uid: string } }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    date: '',
    service: '',
  })

  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const bookingRef = doc(db, 'bookings', `${params.uid}-${Date.now()}`)
      await setDoc(bookingRef, {
        ...form,
        createdAt: Timestamp.now(),
        to: params.uid,
        status: 'pending',
      })
      alert('Booking request sent!')
      router.push(`/profile/${params.uid}`)
    } catch (err) {
      console.error('Error sending booking request:', err)
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold mb-2">Request Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="email" placeholder="Your Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="service" placeholder="Service (e.g. Mixing, Session, Shoot)" value={form.service} onChange={handleChange} className="w-full p-2 border rounded" />
        <textarea name="message" placeholder="Message" value={form.message} onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-black text-white rounded">Send Booking Request</button>
      </form>
    </div>
  )
}
