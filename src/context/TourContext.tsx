'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type TourContextType = {
  step: number
  nextStep: () => void
}

const TourContext = createContext<TourContextType>({
  step: 0,
  nextStep: () => {},
})

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(0)
  const nextStep = () => setStep((prev) => prev + 1)

  return (
    <TourContext.Provider value={{ step, nextStep }}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => useContext(TourContext)
