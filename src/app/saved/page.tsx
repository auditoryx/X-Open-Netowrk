'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getAllCreators } from '@/lib/firestore/getAllCreators'
import Link from 'next/link'

const SavedPage = () => {
  const { user } = useAuth()
  const [creators, setCreators] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      if (!user) return
      const all = await getAllCreators()
      setCreators(all.filter((c) => user.favorites?.includes(c.uid)))
    }
    fetch()
  }, [user])

  if (!user) return <p>Loading…</p>
  if (!creators.length) return <p>You haven’t saved anyone yet.</p>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Saved Creators</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((c) => (
          <Link key={c.uid} href={\`/profile/\${c.uid}\`}>
            <div className="p-4 border rounded hover:shadow">
              <h3 className="font-semibold">{c.displayName}</h3>
              <p className="text-sm">{c.role}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SavedPage
