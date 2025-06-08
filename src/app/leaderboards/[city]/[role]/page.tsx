'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PointsBadge } from '@/components/profile/PointsBadge'
import { useParams } from 'next/navigation'

interface Entry {
  uid: string
  name?: string
  points: number
}

export default function LeaderboardCityRolePage() {
  const params = useParams()
  const city = Array.isArray(params.city) ? params.city[0] : params.city
  const role = Array.isArray(params.role) ? params.role[0] : params.role
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    async function load() {
      const col = collection(db, 'leaderboards', city as string, role as string)
      const q = query(col, orderBy('points', 'desc'))
      const snap = await getDocs(q)
      setEntries(snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) })) as Entry[])
    }
    if (city && role) load()
  }, [city, role])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4 capitalize">
        {city} {role} Leaderboard
      </h1>
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr>
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">XP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={e.uid} className="border-t border-neutral-700">
              <td className="py-1 pr-4">{i + 1}</td>
              <td className="py-1 pr-4">{e.name || e.uid}</td>
              <td className="py-1 pr-4">
                <PointsBadge points={e.points} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
