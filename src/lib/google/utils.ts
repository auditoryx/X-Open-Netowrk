export function getNextDateForWeekday(weekday: string): string {
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  } as const;

  const today = new Date();
  const result = new Date();
  const diff = ((dayMap as any)[weekday] + 7 - today.getDay()) % 7;
  result.setDate(today.getDate() + diff);
  return result.toISOString().split('T')[0];
}
