'use client'

import React from 'react'
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import Link from 'next/link'

const DiscoveryGrid = ({ creators }: { creators: any[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((c) => (
        <Link key={c.uid} href={\`/profile/\${c.uid}\`}>
          <div className="p-4 border rounded-lg hover:shadow-md">
            <h3 className="font-semibold text-lg">{c.displayName}</h3>
            <p className="text-sm text-gray-600">{c.role}</p>
            <p className="text-sm mt-1 line-clamp-2">{c.bio}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {c.verified && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">✔ Verified</span>}
              {c.proTier && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">🌟 Pro</span>}
              <span>{c.location}</span>
{nextAvailable && (<p className="text-sm text-green-600">Next available: {nextAvailable}</p>)}
            </div>
{nextAvailable && (<p className="text-sm text-green-600">Next available: {nextAvailable}</p>)}
          </div>
        </Link>
      ))}
{nextAvailable && (<p className="text-sm text-green-600">Next available: {nextAvailable}</p>)}
    </div>
  )
}

export default DiscoveryGrid
