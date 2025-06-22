'use client'

import { createContext, useContext, useState } from 'react'

interface TourContextType {
  run: boolean
  startTour: () => void
  stopTour: () => void
}

const TourContext = createContext<TourContextType>({
  run: false,
  startTour: () => {},
  stopTour: () => {},
})

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [run, setRun] = useState(false)

  const startTour = () => setRun(true)
  const stopTour = () => setRun(false)

  return (
    <TourContext.Provider value={{ run, startTour, stopTour }}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => useContext(TourContext)
