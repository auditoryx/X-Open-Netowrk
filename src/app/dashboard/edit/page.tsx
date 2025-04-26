'use client'

import React from 'react'
import ProfileCompletionMeter from '@/components/profile/ProfileCompletionMeter'
import AvailabilitySelector from '@/components/profile/AvailabilitySelector'

const EditDashboard = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Your Profile</h1>
      
      <ProfileCompletionMeter />
      <AvailabilitySelector />

      {/* Add more profile components below */}
    </div>
  )
}

export default EditDashboard
