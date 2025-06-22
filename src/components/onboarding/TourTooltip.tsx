'use client'

import React from 'react'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useTour } from '@/context/TourContext'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Combines a globally-available react-tooltip instance (for simple
 * `data-tooltip-id="tour-tooltip"` hints) with an animated onboarding
 * tour driven by `useTour()`.
 */
export default function TourTooltip() {
  const { step, nextStep } = useTour()

  // Onboarding copy — tweak as needed.
  const steps: { text: string }[] = [
    { text: 'Welcome to AuditoryX. Let me show you around.' },
    { text: 'This is your dashboard — everything lives here.' },
    { text: 'Click anything to start creating magic.' },
  ]

  return (
    <>
      {/* Plain react-tooltip, always mounted once */}
      <Tooltip id="tour-tooltip" place="bottom" />

      {/* Animated onboarding bubbles (only while steps remain) */}
      <AnimatePresence>
        {step < steps.length && (
          <motion.div
            key={step}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white px-4 py-3 rounded-xl shadow-xl max-w-sm text-black cursor-pointer"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={nextStep}
          >
            <p className="text-sm">{steps[step].text}</p>
            <p className="mt-2 text-xs text-right text-gray-500">
              Click to continue
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
