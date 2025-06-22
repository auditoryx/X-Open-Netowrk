'use client'
import React from 'react'
import { useTour } from '@/context/TourContext'
import { motion } from 'framer-motion'

export default function TourTooltip() {
  const { step, nextStep } = useTour()

  const steps = [
    { text: 'Welcome to AuditoryX. Let me show you around.' },
    { text: 'This is your dashboard — everything lives here.' },
    { text: 'Click anything to start creating magic.' },
  ]

  if (step >= steps.length) return null

  return (
    <motion.div
      className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-3 rounded-xl shadow-xl max-w-sm text-black"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={nextStep}
    >
      <p className="text-sm">{steps[step].text}</p>
      <p className="text-xs text-right mt-2 text-gray-500">Click to continue</p>
    </motion.div>
  )
}
