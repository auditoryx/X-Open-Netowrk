'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const ref = doc(db, 'leaderboards', 'weekly')
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setEntries((snap.data() as any).entries || [])
      }
    }
    load()
  }, [])

  if (!entries?.length) {
    return (
      <p className="p-6 text-center text-gray-400">No scores this week — check back soon!</p>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Weekly Leaderboard</h1>
      <ol className="space-y-2">
        {entries.map((e, i) => (
          <li key={e.uid} className="border border-neutral-700 p-2 rounded">
            #{i + 1} {e.uid} - {e.points} XP
          </li>
        ))}
      </ol>
    </div>
  )
}
