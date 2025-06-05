'use client'

import { CheckCircle } from 'lucide-react'

export default function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-blue-400 text-xs font-semibold" title="Verified user">
      <CheckCircle className="w-3 h-3" />
      Verified
    </span>
  )
}
