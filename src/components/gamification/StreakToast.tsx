'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/hooks/useAuth'

export default function StreakToast() {
  const { userData } = useAuth()

  useEffect(() => {
    const streak = userData?.streakCount || 0
    if (streak < 7 || streak % 7 !== 0) return
    const last = Number(localStorage.getItem('celebratedStreak') || '0')
    if (streak !== last) {
      toast.success(`⚡ ${streak}-day streak! +50 XP`)
      localStorage.setItem('celebratedStreak', String(streak))
    }
  }, [userData?.streakCount])

  return null
}
