'use client'
import React, { createContext, useContext, useState } from 'react'

type TourContextType = {
  step: number
  setStep: (s: number) => void
  nextStep: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(0)
  const nextStep = () => setStep((s) => s + 1)

  return (
    <TourContext.Provider value={{ step, setStep, nextStep }}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}
