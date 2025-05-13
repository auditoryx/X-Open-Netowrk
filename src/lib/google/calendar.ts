import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';

type Slot = { day: string; time: string };

export async function syncFromGoogleCalendar(token: string, uid: string) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: token });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items || [];

  const busySlots: Slot[] = events.map((event) => {
    const date = new Date(event.start?.dateTime || event.start?.date || '');
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const time = date.toTimeString().slice(0, 5);
    return { day, time };
  });

  await adminDb.doc(`availability/${uid}`).set({
    busySlots,
    lastSynced: new Date().toISOString(),
  }, { merge: true });

  return busySlots;
}

export async function pushToGoogleCalendar(token: string, uid: string, slots: Slot[]) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: token });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  for (const slot of slots) {
    const nextDate = getNextDateForWeekday(slot.day);

    const start = new Date(`${nextDate}T${slot.time}:00`);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-min block

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'Available via AuditoryX',
        description: 'Booked through AuditoryX Platform',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    });
  }
}

const dayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;

type DayOfWeek = keyof typeof dayMap;

function getNextDateForWeekday(weekday: DayOfWeek): string {
  const today = new Date();
  const result = new Date();
  const diff = (dayMap[weekday] + 7 - today.getDay()) % 7;
  result.setDate(today.getDate() + diff);
  return result.toISOString().split('T')[0];
}
