import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { app } from '@/lib/firebase'

const db = getFirestore(app)

export async function POST(req: NextRequest) {
  console.log('✅ [API] /api/book route hit')

  try {
    const data = await req.json()
    console.log('📦 Booking Data Received:', data)

    const docRef = await addDoc(collection(db, 'bookings'), {
      ...data,
      createdAt: Timestamp.now(),
      status: 'pending'
    })

    console.log('✅ Booking saved with ID:', docRef.id)
    return NextResponse.json({ bookingId: docRef.id })
  } catch (err) {
    console.error('❌ Booking API Error:', err)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}
