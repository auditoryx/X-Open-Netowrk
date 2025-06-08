/** @jest-environment jsdom */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import UtilisationCard from '../UtilisationCard'
import TravelDaysCard from '../TravelDaysCard'
import FeaturesSoldCard from '../FeaturesSoldCard'
import MixesDeliveredCard from '../MixesDeliveredCard'

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'uid' } })
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}))

import { doc, getDoc } from 'firebase/firestore'

const mockedDoc = doc as jest.MockedFunction<typeof doc>
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>

beforeEach(() => {
  mockedDoc.mockReturnValue('ref' as any)
})

test('UtilisationCard displays value', async () => {
  mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ metrics: { utilisation: 7 } }) } as any)
  const div = document.createElement('div')
  const root = createRoot(div)
  await act(async () => {
    root.render(<UtilisationCard />)
  })
  await Promise.resolve()
  expect(div.textContent).toContain('7')
})

test('TravelDaysCard displays value', async () => {
  mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ metrics: { travelDays: 3 } }) } as any)
  const div = document.createElement('div')
  const root = createRoot(div)
  await act(async () => {
    root.render(<TravelDaysCard />)
  })
  await Promise.resolve()
  expect(div.textContent).toContain('3')
})

test('FeaturesSoldCard displays value', async () => {
  mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ metrics: { featuresSold: 2 } }) } as any)
  const div = document.createElement('div')
  const root = createRoot(div)
  await act(async () => {
    root.render(<FeaturesSoldCard />)
  })
  await Promise.resolve()
  expect(div.textContent).toContain('2')
})

test('MixesDeliveredCard displays value', async () => {
  mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ metrics: { mixesDelivered: 5 } }) } as any)
  const div = document.createElement('div')
  const root = createRoot(div)
  await act(async () => {
    root.render(<MixesDeliveredCard />)
  })
  await Promise.resolve()
  expect(div.textContent).toContain('5')
})
