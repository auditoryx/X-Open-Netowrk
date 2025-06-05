import { DateTime } from 'luxon';

export type CalendarEvent = {
  start: string; // ISO datetime
  end: string;   // ISO datetime
  summary: string;
  description?: string;
};

function formatDate(date: DateTime) {
  return date.toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'");
}

export function exportToICal(events: CalendarEvent[]): string {
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AuditoryX//EN'];

  for (const evt of events) {
    const start = DateTime.fromISO(evt.start);
    const end = DateTime.fromISO(evt.end);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${start.toMillis()}@auditoryx`);
    lines.push(`DTSTAMP:${formatDate(DateTime.utc())}`);
    lines.push(`DTSTART:${formatDate(start)}`);
    lines.push(`DTEND:${formatDate(end)}`);
    lines.push(`SUMMARY:${evt.summary}`);
    if (evt.description) lines.push(`DESCRIPTION:${evt.description}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
