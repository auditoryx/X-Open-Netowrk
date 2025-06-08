import { parseAvailability } from '@/lib/csv/parseAvailability'

test('parses CSV into slots', () => {
  const csv = `room,date,start,end\nA,2024-06-01,09:00,11:00\nA,2024-06-02,09:00,11:00\nB,2024-06-01,10:00,12:00\nB,2024-06-02,10:00,12:00\nC,2024-06-01,08:00,10:00\nC,2024-06-02,08:00,10:00\nC,2024-06-03,08:00,10:00`;
  const slots = parseAvailability(csv);
  expect(slots).toHaveLength(7);
  expect(slots[0]).toEqual({
    roomId: 'A',
    dateISO: '2024-06-01',
    startTime: '09:00',
    endTime: '11:00',
  });
});
