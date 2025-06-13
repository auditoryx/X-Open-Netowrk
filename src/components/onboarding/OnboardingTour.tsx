'use client'

import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

const steps: Step[] = [
  {
    target: '#nav-dashboard',
    content: 'Access your dashboard here.',
  },
  {
    target: '#nav-explore',
    content: 'Discover other creators on the explore page.',
  },
  {
    target: '#nav-bookings',
    content: 'View and manage your bookings.',
  },
  {
    target: '#nav-profile',
    content: 'Update your profile information.',
  },
  {
    target: '#review-prompt',
    content: 'Leave reviews for completed work.',
  },
]

export default function OnboardingTour() {
  const { userData } = useAuth()
  const [run, setRun] = useState(!!userData?.isNew)

  const handleCallback = (data: CallBackProps) => {
    const finished = [STATUS.FINISHED, STATUS.SKIPPED]
    if (finished.includes(data.status)) {
      setRun(false)
    }
  }

  if (!run) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      callback={handleCallback}
      styles={{ options: { zIndex: 10000 } }}
    />
  )
}
