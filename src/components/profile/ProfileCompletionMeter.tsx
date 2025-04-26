'use client'

import React, { useEffect, useState } from 'react'
import { getUserProfile } from '@/lib/getUserProfile'
import { useAuth } from '@/lib/hooks/useAuth'

const REQUIRED_FIELDS = ['displayName', 'bio', 'mediaSamples', 'location', 'services', 'availability', 'socialLinks']

const ProfileCompletionMeter = () => {
  const { user } = useAuth()
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) return
      const profile = await getUserProfile(user.uid)
      const filled = REQUIRED_FIELDS.filter((field) => {
        const val = profile?.[field]
        return Array.isArray(val) ? val.length > 0 : !!val
      })
      const percent = Math.round((filled.length / REQUIRED_FIELDS.length) * 100)
      setCompletion(percent)
    }

    checkCompletion()
  }, [user])

  if (!user) return null

  return (
    <div className="w-full mt-4">
      <p className="text-sm font-medium">Profile Completion: {completion}%</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: \`\${completion}%\` }}
        />
      </div>
    </div>
  )
}

export default ProfileCompletionMeter
