'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS'

export default function NotificationsPanel() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setNotifications(items)
    })

    return () => unsub()
  }, [user?.uid])

  const markAsSeen = async (notifId: string) => {
    if (!user?.uid) return
    await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), {
      seen: true
    })
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">📥 Notifications</h2>
      {notifications.length === 0 && (
        <p className="text-gray-400 text-sm">No new notifications.</p>
      )}
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`border rounded p-3 text-sm ${
              n.seen ? 'bg-neutral-900' : 'bg-blue-900'
            }`}
            onClick={() => markAsSeen(n.id)}
          >
            <Link href={n.link || '/dashboard'}>
              <div className="cursor-pointer">
                <strong>{n.title}</strong>
                <p className="text-gray-300">{n.message}</p>
                <p className="text-xs text-gray-400">
                  {n.createdAt?.toDate
                    ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })
                    : ''}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
