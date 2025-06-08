export type CsvSlot = {
  roomId: string;
  dateISO: string;
  startTime: string;
  endTime: string;
};

export function parseAvailability(csv: string): CsvSlot[] {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const result: CsvSlot[] = [];
  const startIndex = /room/i.test(lines[0]) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [roomId, date, startTime, endTime] = line.split(',').map((s) => s.trim());
    if (!roomId || !date || !startTime || !endTime) continue;
    const iso = new Date(date).toISOString().slice(0, 10);
    result.push({ roomId, dateISO: iso, startTime, endTime });
  }

  return result;
}
