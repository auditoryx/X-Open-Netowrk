import { useEffect, useState } from 'react'
import { onSnapshot, query, where, collection, getFirestore } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export function useUserBookings(uid: string) {
  const [bookings, setBookings] = useState<{ date: string; time: string }[]>([])

  useEffect(() => {
    if (!uid) return

    const db = getFirestore(app)
    const q = query(
      collection(db, 'bookings'),
      where('providerId', '==', uid),
      where('status', '!=', 'cancelled')
    )

    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => doc.data()) as any)
    })

    return () => unsub()
  }, [uid])

  return bookings
}
