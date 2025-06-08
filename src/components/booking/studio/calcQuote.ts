import type { Room } from '@/types/user'

export function calcQuote(room: Room, hours: number, withEngineer: boolean) {
  return room.hourlyRate * hours + (withEngineer ? room.engineerFee : 0)
}
