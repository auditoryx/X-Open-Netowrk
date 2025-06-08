import { calcQuote } from '@/components/booking/studio/calcQuote'
import type { Room } from '@/types/user'

test('calculates quote with engineer correctly', () => {
  const room: Room = { name: 'A', hourlyRate: 60, minBlock: 1, hasEngineer: true, engineerFee: 30 }
  expect(calcQuote(room, 3, true)).toBe(210)
})
