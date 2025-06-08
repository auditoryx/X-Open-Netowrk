'use client'

import { useEffect, useState } from 'react'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { useAuth } from '@/lib/hooks/useAuth'

export default function MixesDeliveredCard() {
  const { user } = useAuth()
  const [value, setValue] = useState(0)

  useEffect(() => {
    async function fetchMetric() {
      if (!user?.uid) return
      const db = getFirestore(app)
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        setValue(snap.data()?.metrics?.mixesDelivered ?? 0)
      }
    }
    fetchMetric()
  }, [user])

  if (!user) return null

  return (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
      <h3 className="text-sm mb-1">Mixes Delivered</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
