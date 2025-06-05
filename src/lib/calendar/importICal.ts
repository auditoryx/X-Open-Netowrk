export type Slot = { day: string; time: string };

export function parseICalToSlots(ics: string): Slot[] {
  const regex = /DTSTART[^:]*:([0-9TZ]+)/g;
  const slots: Slot[] = [];
  let match;
  while ((match = regex.exec(ics))) {
    const date = new Date(match[1]);
    if (isNaN(date.getTime())) continue;
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const time = date.toTimeString().slice(0, 5);
    slots.push({ day, time });
  }
  return slots;
}
