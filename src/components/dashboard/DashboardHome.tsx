'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { useAuth } from '@/lib/hooks/useAuth'
import NotificationsPanel from './NotificationsPanel'
import { ProfileTrustStats } from '@/components/profile/ProfileTrustStats'
import UtilisationCard from './kpi/UtilisationCard'
import TravelDaysCard from './kpi/TravelDaysCard'
import FeaturesSoldCard from './kpi/FeaturesSoldCard'
import MixesDeliveredCard from './kpi/MixesDeliveredCard'

export default function DashboardHome() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = auth.onAuthStateChanged(async current => {
      if (!current) {
        router.push('/login')
        return
      }
      const db = getFirestore(app)
      const q = query(collection(db, 'bookingRequests'), where('buyerId', '==', current.uid))
      const snap = await getDocs(q)
      const upcoming = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => ['accepted', 'paid'].includes(b.status))
        .slice(0, 3)
      setBookings(upcoming)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  return (
    <div className="p-6 text-white space-y-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Hi {userData?.name || 'there'} 👋</h2>
        <div>{userData?.role === 'studio' && <UtilisationCard />}</div>
        <div>{userData?.role === 'videographer' && <TravelDaysCard />}</div>
        <div>{userData?.role === 'artist' && <FeaturesSoldCard />}</div>
        <div>
          {(userData?.role === 'producer' || userData?.role === 'engineer') && (
            <MixesDeliveredCard />
          )}
        </div>
      </div>
      <NotificationsPanel />
      <section>
        <h2 className="text-xl font-bold mb-2">Upcoming Bookings</h2>
        {bookings.length === 0 ? (
          <p>No upcoming bookings.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map(b => (
              <li key={b.id} className="border border-neutral-700 p-3 rounded">
                {b.serviceId} – {b.status}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-bold mb-2">Recent Messages</h2>
        <p>No new messages.</p>
      </section>
      <ProfileTrustStats />
    </div>
  )
}
