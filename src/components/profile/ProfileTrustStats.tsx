'use client'

import React, { useEffect, useState } from 'react'
import { getTrustStats } from '@/lib/firestore/getTrustStats'

type Props = {
  uid: string
  verified?: boolean
  proTier?: boolean
  lastActive?: string
}

const ProfileTrustStats = ({ uid, verified, proTier, lastActive }: Props) => {
  const [stats, setStats] = useState<{ rating: number; total: number }>({ rating: 0, total: 0 })

  useEffect(() => {
    getTrustStats(uid).then(setStats)
  }, [uid])

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
      {verified && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">✔ Verified</span>}
      {proTier && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">🌟 Pro</span>}
      <span>{stats.total} bookings</span>
      <span>{stats.rating.toFixed(1)} ★</span>
      {lastActive && <span>Last active: {lastActive}</span>}
    </div>
  )
}

export default ProfileTrustStats
